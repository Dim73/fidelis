<?php
 header('Content-type: application/json; charset=utf-8');
 //header("Content-type: text/html; charset=utf-8"); 
  //header('Content-type: application/json; charset: utf-8');
  $output = false;
  $mnmn = 0;
  //dlog($request);
  //dlog($page);
  //var_export($request);
  if($request[0]=='auth') {
    if(isset($_POST['auth']['login']) and isset($_POST['auth']['password'])) {
      $_POST['login'] = $_POST['auth']['login'];
      $_POST['password'] = $_POST['auth']['password'];
    }
    $res = $db->query('select * from `users` where `email`="'.addslashes(trim($_POST['login'])).'" and `password`= "'.addslashes(trim($_POST['password'])).'"');
    if($res->num_rows==1) {
      $row = $res->fetch_assoc();
      unset($row['password']);
      $_SESSION['auth'] = $row;
      $db->query('update `basket` set `user`="'.$row['id'].'" where `session`="'.addslashes(session_id()).'"');
      $output = true;
      //$output = $_SESSION['auth'];
    }
  } else
  if($request[0]=='forms') {
    if(isset($_REQUEST['callme'])) {
      if($_REQUEST['callme']['who']!='scr') die('you look like bot');
      $managr_mail = $cmsVars['manager_order'];
      $subj = '=?UTF-8?B?'.base64_encode('Обратный звонок '.date('Y-m-d H:i:s'))."?=";
      mail($managr_mail,$subj,
           quoted_printable_encode('ФИО: '.$_REQUEST['callme']['fio']."<br>".
                                   'Телефон: '.$_REQUEST['callme']['phone']."<br>"),
           "From: noreply@farmodd.ru"."\r\n".
           "Reply-To: noreply@farmodd.ru"."\r\n".
           "Content-Type:text/html; charset=utf-8;"."\r\n".
           "Content-Transfer-Encoding: quoted-printable"."\r\n"
          );
      $output['result'] = 'Заявка на обратный звонок успешно отправлена.';

    } else
    if(isset($_REQUEST['subscribe'])) {
      $res=$db->query('insert into `subscribe` (`email`,`date`) values ("'.addslashes(trim($_REQUEST['subscribe'])).'",NOW())');
      if($res) $output['result']='Спасибо за подписку'; else $output['result']='Указанный email уже подписан';
    } else
    if(isset($_REQUEST['order'])) {
      $managr_mail = $cmsVars['manager_order'];
      if(!isset($_SESSION['auth'])) {
        if(strlen($_POST['order']['mail'])<5) die(false);
        $client_mail = $_POST['order']['mail'];
        $client_id = 'null';
      } else {
        $client_mail = $_SESSION['auth']['email'];
        $client_id = $_SESSION['auth']['id'];
      }

      $res=$db->query('SELECT `basket`.`count` as `bcount`,`basket`.`cost` as `bcost`,`basket`.`cost_discount` as `cost_discount`,`items_view`.*,`items`.`description_1c` FROM `basket`,`items_view`,`items`
                      where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
                      and `items`.`id`=`items_view`.`id` and `items_view`.`size`=`basket`.`size`
                      group by `code`,`items_view`.`size`');
      //$res=$db->query('SELECT `basket`.`count` as `bcount`,`basket`.`cost` as `bcost`,`items_view`.* FROM `basket`,`items_view` where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`');
      $basket = array();
      $csv = array();
      $tcost = 0;

      $yandex = array();
      $yandex['currency'] = "RUR";
      $yandex['exchange_rate'] = 1;      
      $goods = array();

      while($row=$res->fetch_assoc()) {
        $good = array();
        $csv[]= $row['code']."|".number_format($row['size'],1)."|".$row['description_1c']."|".$row['bcount'];


        $basket[] = '<tr><td>'.$row['name'].($row['size']>0?' (размер: '.number_format($row['size'],1).')':'').'</td><td>'.$row['code'].'</td>'.
                    '<td>'.$row['articul'].'</td>'.
                    '<td>'.$row['bcount'].'</td>'.
                    '<td>'.number_format(($row['cost_discount']>0?$row['cost_discount']:$row['bcount']),2).'</td></tr>';
        $tcost += $row['bcount']*($row['cost_discount']>0?$row['cost_discount']:$row['bcost']);
        
        $good['id'] = $row['code'];
        $good['name'] = $row['name'];
        $good['price'] = ($row['cost_discount']>0?$row['cost_discount']:$row['bcost']);
        $good['quantity'] = $row['bcount'];
        
        $goods[] = $good;
      }           

      $promo = false;
      if(isset($_SESSION['promocode'])) {
        if(isset($_SESSION['promocode']['discount'])) { //percent
          $tcost_promo = $tcost*(100-$_SESSION['promocode']['discount'])/100;
          $promoword = $_SESSION['promocode']['word'];
          $promo = true;
        } else
        if (isset($_SESSION['promocode']['count'])) { //sum
          $tcost_promo = $tcost-$_SESSION['promocode']['count'];
          if($tcost_promo<0) $tcost_promo=0;
          $promoword = $_SESSION['promocode']['code'];
          $promo = true;
          $res=$db->query('update `promo_certs` set `used`=1 where `code`="'.$_SESSION['promocode']['code'].'"');
        }
      }


      $csv = iconv('utf-8','windows-1251',implode("\r\n",$csv));
      $basket ='<table border="1" cellspacing="0" cellpadding="7"><tr>
      <th>Название</th><th>ID</th><th>Артикул</th><th>Кол-во</th><th>Цена</th>
      </tr>'.
      implode($basket).
      '<tr><td colspan="4">Итого: </td><td>'.$tcost.'</td></tr>'.
      ($promo?'<tr><td colspan="3">Итого с промокодом ('.$promoword.'): </td><td>'.$tcost_promo.'</td></tr>':'').
      '</table>';

      $yandex['order_price'] = $tcost;      
	  $yandex['goods'] = $goods;
      //$output = $basket;

      switch($_REQUEST['order']['delivery']) {
        case 'self':
            $delivery = 'Самовывоз ('.$_SESSION['active_city']['name'].')';
            break;
        case 'courier':
            $delivery = 'Доставка курьером ('.$_SESSION['active_city']['name'].')';
        break;
        case 'spsr_regions':
          $delivery = 'СПСР в регионы';
          require "workers/spsr.php";
          $spsr_cities = getCities();
          $_REQUEST['order']['city']=$spsr_cities['Cities'][$_REQUEST['order']['city']]['name'];
          if(isset($_REQUEST['order']['spsr_delivery']))
          $delivery .='('.$_REQUEST['order']['spsr_delivery'].')';

        break;
        default: die('wrong value delivery');
      }

      $res = $db->query('select * from `paytypes`');
      $paytypes = array();
      while($row=$res->fetch_assoc()) $paytypes[$row['alias']] = $row;

      if(!isset($paytypes[$_REQUEST['order']['paytype']])) die('wrong value paytype');

      function getACQPtoken($prod_id,$amount,$cf){
        return md5('693'.$prod_id.$amount.$cf.'LftH59N5Vfd1');
      };

      if($paytypes[$_REQUEST['order']['paytype']]['alias']=='cashlesscard') {
        $pay_status = 2;
        $output['type']='form';
      } else {
        $pay_status = 1;
        $output['type']='url';
        $output['url'] = '/complete/success.html';
      }

	  $orderY = json_encode($yandex);
      $sql = 'insert into `orders` (`user`,`items`,`date`,`paytype_id`,`payment_status`,`delivery`,`request`,`csv`,`yandex`) values (
                        '.$client_id.',
                        "'.addslashes($basket).'",
                        NOW(),
                        '.$paytypes[$_REQUEST['order']['paytype']]['id'].',
                        '.$pay_status.',
                        "'.addslashes($delivery).'",
                        "'.addslashes(serialize($_REQUEST['order'])).'",
                        "'.addslashes($csv).'",
						"'.addslashes($orderY).'")';


      $f = fopen('./logs/sql.log','a');
      fwrite($f,'====================='."\n");
      fwrite($f,$sql."\n\n");
      fclose($f);
      $res = $db->query($sql);
      $onumber = $db->insert_id;

      if (isset($output['url']) && $output['url'] != '') $output['url'] .= '?order='.$onumber;
	  $yandex['order_id'] = $onumber;
      $output['yandex'] = json_encode($yandex);
      if($pay_status==2) {
        $amount = ($promo?$tcost_promo:$tcost);
        $prod_id = "4035";
        $output['form'] = '<form method="post" action="https://secure.acquiropay.com/">
          <input type="hidden" name="product_id" value="'.$prod_id.'">
          <input type="hidden" name="token" value="'.getACQPtoken($prod_id,$amount,$onumber).'">
          <input type="hidden" name="amount" value="'.$amount.'">
          <input type="hidden" name="cf" value="'.$onumber.'">
          <input type="hidden" name="cb_url" value="http://farmodd.ru/acqp_callback.php">
          <input type="hidden" name="ok_url" value="http://farmodd.ru/complete/success.html?order='.$onumber.'">
          <input type="hidden" name="ko_url" value="http://farmodd.ru/complete/reject.html">
        </form>';
      }
      else
      {
      $db->query('delete from `basket` where `session`="'.session_id().'"');
      $mime_boundary = "--".strtoupper(uniqid(time()));
      $subj = '=?UTF-8?B?'.base64_encode('Заказ с сайта '.date('Y-m-d H:i:s'))."?=";
      //if($_REQUEST['order']['name']!=='ТЕСТ')
      mail($managr_mail,$subj,
           '--'.$mime_boundary."\r\n".
           "Content-Type:text/html; charset=utf-8;"."\r\n".
           "Content-Transfer-Encoding: quoted-printable"."\r\n"."\r\n".
           quoted_printable_encode('ФИО: '.$_REQUEST['order']['family'].' '.$_REQUEST['order']['name']."<br>".
              'Телефон: '.$_REQUEST['order']['phone']."<br>".
              'Email: '.$_REQUEST['order']['mail']."<br>".
              'Город: '.$_REQUEST['order']['city']."<br>".
              'Адрес: '.$_REQUEST['order']['address']."<br>".
              'Почтовый индекс: '.$_REQUEST['order']['postindex']."<br>".
              'Доставка: '.$delivery."<br>".
              'Оплата: '.$paytypes[$_REQUEST['order']['paytype']]['name']."<br>".
              $basket).
           "\r\n"."\r\n".
           '--'.$mime_boundary."\r\n".
           "Content-Type: text/csv; name=\"order.csv\""."\r\n".
           "Content-Transfer-Encoding:base64"."\r\n".
           "Content-Disposition:attachment; filename=\"order.csv\""."\r\n"."\r\n".
           chunk_split(base64_encode($csv))."\r\n"."\r\n".
           '--'.$mime_boundary.'--'
           ,
           "From: noreply@farmodd.ru"."\r\n".
           "Reply-To: noreply@farmodd.ru"."\r\n".
           "Mime-Version: 1.0"."\r\n".
           "Content-Type: multipart/mixed; boundary=\"".$mime_boundary."\""."\r\n"."\r\n"
          );

      $basket=file_get_contents('./template/ordermail_header.html').$basket.file_get_contents('./template/ordermail_footer.html');
      $subj = '=?UTF-8?B?'.base64_encode('Заказ с сайта Фиделис')."?=";
      //if($_REQUEST['order']['name']!=='ТЕСТ')
      mail($client_mail,$subj,$basket,
           'From: noreply@farmodd.ru'."\r\n".
           'Content-type: text/html; charset=utf-8'."\r\n");
      $output['ok'] = true;
    }

      //$output= var_export($_SESSION['auth'],true);
      //$output=var_export($_REQUEST['order'],true);


    } else
    if(isset($_REQUEST['register'])) {
      $request = $_POST['register'];
      $request['mail'] = addslashes(trim($request['mail']));
      //common login
      $res = $db->query('select * from `users` where `email`="'.$request['mail'].'"');
      if($res->num_rows>0) $output = array('result'=>'Данный e-mail уже зарегистрирован на сайте.','error'=>true);
        else {
          $password = passgen();
          $res=$db->query('insert into `users` (`email`,`password`,`name`,`family`,`phone`,`city`) values (
                     "'.$request['mail'].'",
                     "'.addslashes($password).'",
                     "'.addslashes(trim($request['name'])).'",
                     "'.addslashes(trim($request['family'])).'",
                     "'.addslashes(trim($request['phone'])).'",
                     "'.addslashes(trim($request['city'])).'")');
          if($db->errno==0) {
          $userid = $db->insert_id;
          $_SESSION['auth'] = array(
              'id'=>$userid,
              `name`=>addslashes(trim($request['name'])),
              'family'=>addslashes(trim($request['family'])),
              'phone'=>addslashes(trim($request['phone'])),
              'city'=>addslashes(trim($request['city'])),
          );
          $db->query('update `basket` set `user`="'.$userid.'" where `session`="'.addslashes(session_id()).'"');
          $output = true;
          if(isset($request['wannaaction']))
            @$db->query('insert into `subscribe` (`email`,`date`) values ("'.$request['mail'].'",NOW())');
          }
      }
    }
  } else
  if($request[0]=='basket') {
    if(isset($_REQUEST['clear'])) {
      $db->query('delete from `basket` where `session`="'.session_id().'"');
    } else
    if(isset($_REQUEST['items'])) {
      if(count($_REQUEST['items'])>0 ) {
        $basket = array();
        $res = $db->query('select * from `basket` where `session`="'.session_id().'"');
        while($row=$res->fetch_assoc()) $basket[$row['code']]=$row;
        foreach($_REQUEST['items'] as $item){
          if($item['count']==0) {
              $db->query('delete from `basket` where `session`="'.session_id().'" and `code`="'.$item['item'].'"');
          } else {
              if($item['count']!=$basket[$item['item']]['count'])
                $db->query('update `basket` set `count`="'.addslashes($item['count']).'" where `session`="'.session_id().'" and `code`="'.$item['item'].'"');
          }
        }

        $res = $db->query('SELECT `basket`.`count` as `bcount`,
                    `items_view`.*
                    FROM `basket`,`items_view`
                    where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
                    and `items_view`.`size`=`basket`.`size`
                    group by `code`,`size`');
        $basket_total = $res->num_rows;
        $output = $basket_total;

        //$res = $db->query('SELECT sum(count) as `sum` FROM `basket` where `session`="'.session_id().'"');
        //$row = $res->fetch_assoc();
      }
    } else
    if($_REQUEST['count']>0) {
      $_REQUEST['item']=addslashes(trim($_REQUEST['item']));
      $_REQUEST['count']=addslashes(trim($_REQUEST['count']));
      if(isset($_REQUEST['size']))
        $_REQUEST['size']=addslashes(trim($_REQUEST['size']));
        else $_REQUEST['size']="";
      $user = 'null';
      if((int)$_REQUEST['size']>0)
        $res = $db->query('select min(`cost`) as `cost`,min(`cost_discount`) as `cost_discount`, `size` from `articuls`,`items`
                        where `articuls`.`id`=`items`.`code` and `articuls`.`code`="'.$_REQUEST['item'].'" and `items`.`size` = '.(int)$_REQUEST['size']);
      else
        $res = $db->query('select count(*) as p,max(`cost`) as `cost`,max(`cost_discount`) as `cost_discount`, min(`size`) as `size` from `articuls`,`items`
                        where `articuls`.`id`=`items`.`code` and `articuls`.`code`="'.$_REQUEST['item'].'"');
      if($res->num_rows>0) {
        $stat = $res->fetch_assoc();
        if($_REQUEST['size']=='') $_REQUEST['size'] = $stat['size'];

        if($stat['cost']>$stat['cost_discount']) {
          $sql = 'insert into `basket` (`session`,`code`,`count`,`cost`,`cost_discount`,`user`,`date`,`size`)
          values ("'.session_id().'","'.$_REQUEST['item'].'","'.$_REQUEST['count'].'","'.$stat['cost'].'","'.$stat['cost_discount'].'",'.$user.',NOW(),"'.$_REQUEST['size'].'")
          on duplicate key update `count`=`count`+VALUES(`count`),`cost_discount`="'.$stat['cost_discount'].'", `date`=NOW()';
        } else {
          $sql = 'insert into `basket` (`session`,`code`,`count`,`cost`,`user`,`date`,`size`)
          values ("'.session_id().'","'.$_REQUEST['item'].'","'.$_REQUEST['count'].'","'.$stat['cost'].'",'.$user.',NOW(),"'.$_REQUEST['size'].'")
          on duplicate key update `count`=`count`+VALUES(`count`),`cost_discount`=null, `date`=NOW()';
        }


        $db->query($sql);
        if($db->errno==0) {
            $res = $db->query('SELECT `basket`.`count` as `bcount`,
                     `items_view`.*
                     FROM `basket`,`items_view`
                     where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
                     and `items_view`.`size`=`basket`.`size`
                     group by `code`,`size`');
            $basket_total = $res->num_rows;
            $basket_total_cost = 0;
              while($row=$res->fetch_assoc()) {
                if(!is_null($row['cost_discount']))
                  $basket_total_cost+=$row['cost_discount']*$row['bcount']; else
                  $basket_total_cost+=$row['cost']*$row['bcount'];
              }
              switch($basket_total) {
              case 0:
                  $output = 'пусто';
                break;
              case 1:
                  $output = '1 товар на '.$basket_total_cost.' р';
                break;
              case 2:
              case 3:
              case 4:
                  $output = $basket_total.' товара на '.$basket_total_cost.' р';
                break;
              default:
                  $output = $basket_total.' товаров на '.$basket_total_cost.' р';
                break;
            }
            //$output = $basket_total;


          //$res = $db->query('select * from `basket` where `session`="'.session_id().'"');
          //$output = $res->num_rows;
          //$output=true;
        }
      }
    }
  } else
  if($request[0]=='catalogue') require "ajax_catalogue.php"; 
	
	
	else
	//подписка
	if($request[0]=='go') {		
	  $mnmn = 1;
	  $output = '{"status": false}'; 
	 
		//передаваемые данные	
		$arr = explode('&', $_POST['data']);
		
		$info = array();
		if (count($arr) > 0)
		{
			foreach ($arr as &$value) {
				$tmp = explode('=', $value);				
				$info[$tmp[0]] = urldecode($tmp[1]);
			}
		}
		
		//быстрый заказ
		if (isset($info['code']) && trim($info['code']) != '')
		{
			$url = 'http://fidelis-style.ru/item/'.$info['code'].'.html';
			if (isset($info['name']) && trim($info['name']) != '')
			{
				$managr_mail = $cmsVars['manager_order'];
				$subj = '=?UTF-8?B?'.base64_encode('Быстрый заказ '.date('Y-m-d H:i:s'))."?=";
				if (mail($managr_mail,$subj,
				   quoted_printable_encode('ФИО: '.$info['name']."<br>".
										   'Телефон: '.$info['phone']."<br>".
										   'Интересует: <a href="'.$url.'" target="_blank">'.$info['code']."</a><br>"),
				   "From: noreply@farmodd.ru"."\r\n".
				   "Reply-To: noreply@farmodd.ru"."\r\n".
				   "Content-Type:text/html; charset=utf-8;"."\r\n".
				   "Content-Transfer-Encoding: quoted-printable"."\r\n"))
				$output = '{"status": true}';	
			}			
		}
		else
		{//подписка
			if (isset($info['email']) && trim($info['email']) != '')
			{
				$res=$db->query('insert into `subscribe` (`email`,`phone`, `date`) values ("'.addslashes(trim($info['email'])).'","'.addslashes(trim($info['text'])).'",NOW())');
				if($res) $output = '{"status": true}';
			}//обратный звонок
			elseif (isset($info['fio']) && trim($info['fio']) != '')
			{
				$managr_mail = $cmsVars['manager_order'];
				$subj = '=?UTF-8?B?'.base64_encode('Обратный звонок '.date('Y-m-d H:i:s'))."?=";
				if (mail($managr_mail,$subj,
				   quoted_printable_encode('ФИО: '.$info['fio']."<br>".
										   'Телефон: '.$info['phone']."<br>"),
				   "From: noreply@farmodd.ru"."\r\n".
				   "Reply-To: noreply@farmodd.ru"."\r\n".
				   "Content-Type:text/html; charset=utf-8;"."\r\n".
				   "Content-Transfer-Encoding: quoted-printable"."\r\n"))
				$output = '{"status": true}';	
			}
		}
	}	
	else
	//добавляем товар в корзину
	if($request[0]=='additem') {	  
	  //var_dump($_REQUEST);
	  $output = "{}";
	  $mnmn = 1;
	  if (isset($_REQUEST['data']))
	  {
		  $data = $_REQUEST['data'];
		  $id = (isset($data['id']) ? $data['id']:0);
		  $sizeValue = (isset($data['size']) ? $data['size']:0);
		  $countValue = (isset($data['count']) ? $data['count']:0);
		  if ($id > 0)
		  {
				//определяем код				
				$res = $db->query('select * from `items_view` where `id`="'.$id.'"');
				$info = $res->fetch_assoc();
				$code = $info['code'];
				
				if ($countValue > 0)
				{
					$sql = 'update `basket` set `count`='.$countValue.', `date`=NOW() where `session` = "'.session_id().'" and `code` = "'.$code.'"';
					$db->query($sql);
				}
				else
				{
					if ($sizeValue > 0)
					  $res = $db->query('select * from `items_sizes` where `code`="'.$code.'" and `size` = '.$sizeValue);
					else
					  $res = $db->query('select * from `items_view` where `code`="'.$code.'"');
					  
					if($res->num_rows>0) {
						$stat = $res->fetch_assoc();
						if(!$sizeValue) $sizeValue = $stat['size'];
						$user = 'null';
						$cost = $stat['cost'];
						if($stat['cost']>$stat['cost_discount']) {
						  $sql = 'insert into `basket` (`session`,`code`,`count`,`cost`,`cost_discount`,`user`,`date`,`size`)
						  values ("'.session_id().'","'.$stat['code'].'","1","'.$stat['cost'].'","'.$stat['cost_discount'].'",'.$user.',NOW(),"'.$sizeValue.'")
						  on duplicate key update `count`=`count`+VALUES(`count`),`cost_discount`="'.$stat['cost_discount'].'", `date`=NOW()';
						  $cost = $stat['cost_discount'];
						}
						else 
						  $sql = 'insert into `basket` (`session`,`code`,`count`,`cost`,`user`,`date`,`size`)
						  values ("'.session_id().'","'.$stat['code'].'","1","'.$stat['cost'].'",'.$user.',NOW(),"'.$sizeValue.'")
						  on duplicate key update `count`=`count`+VALUES(`count`),`cost_discount`=null, `date`=NOW()';
						  //echo $sql;
						$db->query($sql);
					}
				}	
				$type = db_get('types',$info['type'],true);
				$img = 'http://fidelis-style.ru/'.$goods_path.$type['alias'].'/108/'.imagename($info['articul']);			
				$info['name'] = htmlentities($info['name'], ENT_QUOTES);;
				$output = '{"id": "'.$id.'","name":"'.$info['name'].'","articul":"'.$info['code'].'", "count": "1", "img": "'.$img.'", "sizes": [{"'.$sizeValue.'": "'.number_format($cost,0,'','').'"}]}';
		  }
	  }
	}
	else
	//содержимое корзины
	if($request[0]=='basketitem') {
		if($db->errno==0) {
			$res = $db->query('SELECT `basket`.`count` as `bcount`,
			`items_view`.*
			FROM `basket`,`items_view`
			where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
			and `items_view`.`size`=`basket`.`size`
			group by `code`,`size`');
			
			/*echo 'SELECT `basket`.`count` as `bcount`,
			`items_view`.*
			FROM `basket`,`items_view`
			where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
			and `items_view`.`size`=`basket`.`size`
			group by `code`,`size`';*/
			while($row=$res->fetch_assoc()) {//var_dump($row);
				//список товаров
				//размеры
				$arrSizeTmp = array();
				if ((int)$row['size'] > 0)
				{
					// and `size` = "'.$row['size'].'"
					$resSize = $db->query('select * from `items_sizes` where code ="'.$row['code'].'" order by size');				
					while($rowSize=$resSize->fetch_assoc()){
						if ($rowSize['size'] == $row['size'])
							$arrSizeTmp[] .= '{"'.$rowSize['size'].'": "'.(($rowSize['cost_discount'] > 0 && $rowSize['cost_discount'] != $rowSize['cost']) ? number_format($rowSize['cost_discount'],0,'',''):number_format($rowSize['cost'],0,'','')).'", "selected": "selected"}';
						else
							$arrSizeTmp[] .= '{"'.$rowSize['size'].'": "'.(($rowSize['cost_discount'] > 0 && $rowSize['cost_discount'] != $rowSize['cost']) ? number_format($rowSize['cost_discount'],0,'',''):number_format($rowSize['cost'],0,'','')).'"}';
					}
				}
				else
				{
					$arrSizeTmp[] = '{"": "'.(($row['cost_discount'] > 0 && $row['cost_discount'] != $row['cost']) ? number_format($row['cost_discount'],0,'',''):number_format($row['cost'],0,'','')).'"}';					
				}
				$type = db_get('types',$row['type'],true);
				$img = 'http://fidelis-style.ru/'.$goods_path.$type['alias'].'/108/'.imagename($row['articul']);
				$link = '/item/'.$row['code'].'.html';
				$row['name'] = htmlentities($row['name'], ENT_QUOTES);;
				//$row['name'] = iconv('utf-8', 'cp1251', $row['name']);
				//$output[] = array('id'=>$row['id'], 'name'=>$row['name'], 'link'=>$link, 'articul'=>$row['code'], 'count'=>$row['bcount'], 'img'=>$img, 'sizes'=>'');				
				if (count($arrSizeTmp) > 0)
					$output[] = '{"id": "'.$row['id'].'","name":"'.$row['name'].'","link":"'.$link.'", "articul":"'.$row['code'].'", "count": "'.$row['bcount'].'", "img": "'.$img.'", "sizes": ['.implode(",", $arrSizeTmp).']}';
				else
					$output[] = '{"id": "'.$row['id'].'","name":"'.$row['name'].'","link":"'.$link.'", "articul":"'.$row['code'].'", "count": "'.$row['bcount'].'", "img": "'.$img.'", "sizes": [{"":""}]}';
			}
		}
		$mnmn = 1;
		//$ccc = iconv('utf-8','windows-1251',"ГРАФИТОВОЙ ЭМАЛЬЮ ROSA ОТ КОМПАНИИ");
		$output = '['.implode(",", $output).']';
	}
	else
	//удаляем из корзины
	if($request[0]=='basketitemdelete') {		
		if (isset($_REQUEST['id']) && (int)$_REQUEST['id'] > 0)
		{
			$res = $db->query('select code from `items_view` where `id` = '.(int)$_REQUEST['id']);
			$row = $res->fetch_assoc();
			if (isset($row['code']))
			{
				$res = $db->query('select * from `basket` where `session`="'.session_id().'" and `code`="'.$row['code'].'"');
				if($res->num_rows>0) {
					$db->query('delete from `basket` where `session`="'.session_id().'" and `code`="'.$row['code'].'"');
					$mnmn = 1;
					$output = '{}';
				}
			}
		}
	}
	else
	//определям города
	if($request[0]=='town') {		
	//var_dump($_REQUEST);
		if (isset($_REQUEST['region']) && (int)$_REQUEST['region'] > 0)
		{
			require "spsr.php";
			$spsr_cities = getCities();
			//var_dump($spsr_cities);
			//var_dump($spsr_cities['Link'][(int)$_REQUEST['region']]);
			if (count($spsr_cities['Link'][(int)$_REQUEST['region']]) > 0)
			{
				$mnmn = 1;
				foreach($spsr_cities['Link'][(int)$_REQUEST['region']] as $city) {
					$output .= '<option value="'.$city['id'].'">'.$city['name'].'</option>'."\n"; 
				}
			}	
		}
	}
	else
	//информация о доставки
	if($request[0]=='deliveryInfo') {		
		if (isset($_REQUEST['type']) )
		{
			$mnmn = 1;
			switch($_REQUEST['type'])
			{				
				case 'spsr_regions':
					if (isset($_REQUEST['destination']) &&  (int)$_REQUEST['destination']> 0)
					{
						require "spsr.php";
						$res = $db->query('SELECT `basket`.`count` as `bcount`,`basket`.`cost` as `bcost`,`basket`.`cost_discount` as `cost_discount`,`items_view`.*
						FROM `basket`,`items_view`
						where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
						and `items_view`.`size`=`basket`.`size`
						group by `code`,`size`
						');
						$summary=0;

						while($row=$res->fetch_assoc())  {
						  if($row['cost_discount']>0)
							$summary+=$row['bcount']*$row['cost_discount']; else
							$summary+=$row['bcount']*$row['cost'];
						}

						$info = calculateDelivery((int)$_REQUEST['destination'],$summary);		
//var_dump($info['tariff']);
						
						if (is_array($info['tariff']) && count($info['tariff']) > 0)
						{
							$data = $info['tariff'][0];
	//						var_dump($data);
							$output = '{"summ": '.$data['cost'].', "days": "'.$data['days'].'"}';	
						}
					}
				break;
				case 'courier':
					$delivery = 'Доставка курьером ('.$_SESSION['active_city']['name'].')';
					$output = '{"summ": 300, "days": 5-10 дней}';			
				break;				
				default:
					if(isset($_SESSION['active_city'])) {
						$data = $_SESSION['active_city'];						
						$res = $db->query('select cost, lim from `region` where id = "'.$data['id'].'"');						
						if($res->num_rows == 1){							
							$row = $res->fetch_assoc();
							$output = '{"summ": '.$row['cost'].', "days": "'.$row['lim'].'"}';						
						}
					}
				break;
			}
		}
	}	
	else
	//отправляем заказ
	if($request[0]=='deliverySubmit') {		

	 if (!$_POST['data']) {
		$output['ok'] = false; 
		break;
	 }
		//передаваемые данные
		//name=test&family=&phone=%2B7+(123)+456-78-90&email=maya_aa%40mail.ru&paytype=&delivery=spsr_regions&region=46&city=1176&address+require=tyest
		$arr = explode('&', $_POST['data']);
		
		$info = array();
		if (count($arr) > 0)
		{
			foreach ($arr as &$value) {
				$tmp = explode('=', $value);				
				$info[$tmp[0]] = urldecode($tmp[1]);
			}
		}		
	 
		if(!isset($_SESSION['auth'])) {
			if(isset($info['email']) && strlen($info['email']) < 5) die(false);
			$client_mail = $info['email'];
			$client_id = 'null';
		} else {
			$client_mail = $_SESSION['auth']['email'];
			$client_id = $_SESSION['auth']['id'];
		}		
		
		$managr_mail = $cmsVars['manager_order'];
		//содержимое корзины
		$res=$db->query('SELECT `basket`.`count` as `bcount`,`basket`.`cost` as `bcost`,`basket`.`cost_discount` as `cost_discount`,`items_view`.*,`items`.`description_1c` FROM `basket`,`items_view`,`items`
					  where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
					  and `items`.`id`=`items_view`.`id` and `items_view`.`size`=`basket`.`size`
					  group by `code`,`items_view`.`size`');
		$basket = array();
		$csv = array();
		$tcost = 0;

		$yandex = array();
		$yandex['currency'] = "RUR";
		$yandex['exchange_rate'] = 1;      
		$goods = array();		
		while($row=$res->fetch_assoc()) {
			$good = array();
			$csv[]= $row['code']."|".number_format($row['size'],1)."|".$row['description_1c']."|".$row['bcount'];

			$basket[] = '<tr><td>'.$row['name'].($row['size']>0?' (размер: '.number_format($row['size'],1).')':'').'</td><td>'.$row['code'].'</td>'.
						'<td>'.$row['articul'].'</td>'.
						'<td>'.$row['bcount'].'</td>'.
						'<td>'.number_format(($row['cost_discount']>0?$row['cost_discount']:$row['bcount']),2).'</td></tr>';
			$tcost += $row['bcount']*($row['cost_discount']>0?$row['cost_discount']:$row['bcost']);

			$good['id'] = $row['code'];
			$good['name'] = $row['name'];
			$good['price'] = ($row['cost_discount']>0?$row['cost_discount']:$row['bcost']);
			$good['quantity'] = $row['bcount'];

			$goods[] = $good;
		} 
		
		$promo = false;
		if(isset($_SESSION['promocode'])) {
			if(isset($_SESSION['promocode']['discount'])) { //percent
				$tcost_promo = $tcost*(100-$_SESSION['promocode']['discount'])/100;
				$promoword = $_SESSION['promocode']['word'];
				$promo = true;
			} else
			if (isset($_SESSION['promocode']['count'])) { //sum
				$tcost_promo = $tcost-$_SESSION['promocode']['count'];
				if($tcost_promo<0) $tcost_promo=0;
				$promoword = $_SESSION['promocode']['code'];
				$promo = true;
				$res=$db->query('update `promo_certs` set `used`=1 where `code`="'.$_SESSION['promocode']['code'].'"');
			}
		}
		
		$csv = iconv('utf-8','windows-1251',implode("\r\n",$csv));
		$basket ='<table border="1" cellspacing="0" cellpadding="7"><tr>
		<th>Название</th><th>ID</th><th>Артикул</th><th>Кол-во</th><th>Цена</th>
		</tr>'.implode($basket).
		'<tr><td colspan="4">Итого: </td><td>'.$tcost.'</td></tr>'.($promo?'<tr><td colspan="3">Итого с промокодом ('.$promoword.'): </td><td>'.$tcost_promo.'</td></tr>':'').
		'</table>';

		$yandex['order_price'] = $tcost;      
		$yandex['goods'] = $goods;	

		//информация по доставки
		switch($info['delivery']) {
			case 'self':
				$delivery = 'Самовывоз ('.$_SESSION['active_city']['name'].')';
			break;
			case 'post':
				$delivery = 'Доставка почта России ('.$_SESSION['active_city']['name'].')';
				$info['cityName']=$info['postTown'];
			break;			
			case 'courier':
				$delivery = 'Доставка курьером ('.$_SESSION['active_city']['name'].')';
			break;
			case 'spsr_regions':
				$delivery = 'СПСР в регионы';
				require "workers/spsr.php";
				$spsr_cities = getCities();
				$info['cityName']=$spsr_cities['Cities'][$info['city']]['name'];
				//расчет стоимости
				if(isset($_REQUEST['order']['spsr_delivery']))
					$delivery .='('.$_REQUEST['order']['spsr_delivery'].')';
			break;
			default: die('wrong value delivery');
			break;
		}	

		$res = $db->query('select * from `paytypes`');
		$paytypes = array();
		while($row=$res->fetch_assoc()) $paytypes[$row['alias']] = $row;

		if(!isset($paytypes[$info['paytype']])) die('wrong value paytype');

		function getACQPtoken($prod_id, $amount, $cf){
			return md5('693'.$prod_id.$amount.$cf.'LftH59N5Vfd1');
		};

		if($paytypes[$info['paytype']] == 'cashlesscard') {
			$pay_status = 2;
			$output['type']='form';
		} else {
			$pay_status = 1;
			$output['type']='url';
			$output['url'] = '/complete/success.html';
		}

		$orderY = json_encode($yandex);
		$sql = 'insert into `orders` (`user`,`items`,`date`,`paytype_id`,`payment_status`,`delivery`,`request`,`csv`,`yandex`) values (
				'.$client_id.',
				"'.addslashes($basket).'",
				NOW(),
				'.$paytypes[$info['paytype']]['id'].',
				'.$pay_status.',
				"'.addslashes($delivery).'",
				"'.addslashes(serialize($_REQUEST['data'])).'",
				"'.addslashes($csv).'",
				"'.addslashes($orderY).'")';

		$f = fopen('./logs/sql.log','a');
		fwrite($f,'====================='."\n");
		fwrite($f,$sql."\n\n");
		fclose($f);
		$res = $db->query($sql);
		$onumber = $db->insert_id;

		if (isset($output['url']) && $output['url'] != '') $output['url'] .= '?order='.$onumber;
		$yandex['order_id'] = $onumber;
		$output['yandex'] = json_encode($yandex);
		if($pay_status==2) {
			$amount = ($promo?$tcost_promo:$tcost);
			$prod_id = "4035";
			$output['form'] = '<form method="post" action="https://secure.acquiropay.com/">
			<input type="hidden" name="product_id" value="'.$prod_id.'">
			<input type="hidden" name="token" value="'.getACQPtoken($prod_id,$amount,$onumber).'">
			<input type="hidden" name="amount" value="'.$amount.'">
			<input type="hidden" name="cf" value="'.$onumber.'">
			<input type="hidden" name="cb_url" value="http://farmodd.ru/acqp_callback.php">
			<input type="hidden" name="ok_url" value="http://farmodd.ru/complete/success.html?order='.$onumber.'">
			<input type="hidden" name="ko_url" value="http://farmodd.ru/complete/reject.html">
			</form>';
		}
		else
		{
			$db->query('delete from `basket` where `session`="'.session_id().'"');
			$mime_boundary = "--".strtoupper(uniqid(time()));
			$subj = '=?UTF-8?B?'.base64_encode('Заказ с сайта '.date('Y-m-d H:i:s'))."?=";
			//if($_REQUEST['order']['name']!=='ТЕСТ')
			mail($managr_mail,$subj,
			'--'.$mime_boundary."\r\n".
			"Content-Type:text/html; charset=utf-8;"."\r\n".
			"Content-Transfer-Encoding: quoted-printable"."\r\n"."\r\n".
			quoted_printable_encode('ФИО: '.$info['family'].' '.$info['name']."<br>".
			'Телефон: '.$info['phone']."<br>".
			'Email: '.$info['email']."<br>".
			'Город: '.(isset($info['cityName']) ? $info['cityName']:'')."<br>".
			'Адрес: '.(isset($info['address']) ? $info['address']:'')."<br>".
			'Почтовый индекс: '.(isset($info['postindex']) ? $info['postindex']:'')."<br>".
			'Доставка: '.$delivery."<br>".
			'Оплата: '.$paytypes[$info['paytype']]['name']."<br>".
			$basket).
			"\r\n"."\r\n".
			'--'.$mime_boundary."\r\n".
			"Content-Type: text/csv; name=\"order.csv\""."\r\n".
			"Content-Transfer-Encoding:base64"."\r\n".
			"Content-Disposition:attachment; filename=\"order.csv\""."\r\n"."\r\n".
			chunk_split(base64_encode($csv))."\r\n"."\r\n".
			'--'.$mime_boundary.'--'
			,
			"From: noreply@farmodd.ru"."\r\n".
			"Reply-To: noreply@farmodd.ru"."\r\n".
			"Mime-Version: 1.0"."\r\n".
			"Content-Type: multipart/mixed; boundary=\"".$mime_boundary."\""."\r\n"."\r\n"
			);

			$basket=file_get_contents('./template/ordermail_header.html').$basket.file_get_contents('./template/ordermail_footer.html');
			$subj = '=?UTF-8?B?'.base64_encode('Заказ с сайта Фиделис')."?=";
			//if($_REQUEST['order']['name']!=='ТЕСТ')
			mail($client_mail,$subj,$basket,
			'From: noreply@farmodd.ru'."\r\n".
			'Content-type: text/html; charset=utf-8'."\r\n");
			$output['ok'] = true;
		}		
	}		
	
if ($mnmn) 
	print $output;
else
	print json_encode($output);
$db->close();
die();
?>