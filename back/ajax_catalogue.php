<?php
    $filters['items_per_page']=array(array('value'=>12,'name'=>12),array('value'=>24,'name'=>24),array('value'=>36,'name'=>36),array('value'=>'all','name'=>'Все'));
    $filters['items_sort_order']=array(array('value'=>'casc','name'=>'По возрастанию цены&nbsp;'),array('value'=>'cdesc','name'=>'По убыванию цены&nbsp;'),array('value'=>'pop','name'=>'По популярности&nbsp;'),array('value'=>'new','name'=>'По новизне&nbsp;'));
    
    $emptPopCateg = false;
    if (isset($_REQUEST['popular_categ']) && $_REQUEST['popular_categ'] != '')
    {
      $emptPopCateg = $_REQUEST['popular_categ'];
      $TPL['filters_values']['popular_categ'] = $_REQUEST['popular_categ'];
      if (!$emptPopCateg)
        $pop_filter = array_shift($request);
      else 
        $pop_filter = $emptPopCateg;
        $res = $db->query('select * from `popular_tags` where `url` = "'.addslashes($pop_filter).'" limit 1');
        if($res->num_rows==0) _404(); 
        else {
            $pop_filter = $res->fetch_assoc();
            list($pop_filter_type,$pop_filter_id) = explode('_',$pop_filter['main_category']);
            if(isset($request[0]))
              if((int)$request[0]>0)
                $pop_filter_page = (int)$request[0];
           // header('X-debug-1: '.str_replace("\n",' ',var_export($request,true)));
            $request[0] = $pop_filter_type;
            $request[1] = $pop_filter_id;
            $request[2] = (isset($pop_filter_page)?$pop_filter_page:1);
      
            if(strlen(trim($pop_filter['brand']))>0) {
                $pop_filter['brand'] = explode("\t",trim($pop_filter['brand']));
                $_REQUEST['brand'] = implode(',',$pop_filter['brand']);
            }
            if(strlen(trim($pop_filter['collection']))>0) {
                $pop_filter['collection'] = explode("\t",trim($pop_filter['collection']));
                $_REQUEST['collection'] = implode(',',$pop_filter['collection']);
            }
            if(strlen(trim($pop_filter['style']))>0) {
                $pop_filter['style'] = explode("\t",trim($pop_filter['style']));
                $_REQUEST['style'] = implode(',',$pop_filter['style']);
            }
            if(strlen(trim($pop_filter['type']))>0) {
                $pop_filter['type'] = explode("\t",trim($pop_filter['type']));
                $_REQUEST['type'] = implode(',',$pop_filter['type']);
            }
            if(strlen(trim($pop_filter['cover']))>0) {
                $pop_filter['cover'] = explode("\t",trim($pop_filter['cover']));
                $_REQUEST['cover'] = implode(',',$pop_filter['cover']);
            }
            if(strlen(trim($pop_filter['insert']))>0) {
                $pop_filter['insert'] = explode("\t",trim($pop_filter['insert']));
                $_REQUEST['insert'] = implode(',',$pop_filter['insert']);
            }
      	
            if(strlen(trim($pop_filter['extra']))>0) {
      		      $resExtra = $db->query('select name from `extra_pop` where `id` = "'.(int)$pop_filter['extra'].'"');
                if($resExtra->num_rows > 0) {
                  $extra_filterPOP = $resExtra->fetch_assoc();
      				    $_REQUEST['extra_pop'] = trim($extra_filterPOP['name']);
                }
            }		
        }       
    }
    
    //types
    $TPL['types']=array();    $res = $db->query('select * from `types`');
     while($row=$res->fetch_assoc())      $TPL['types'][$row['id']]=array('id'=>$row['id'],'name'=>$row['name'],'alias'=>$row['alias']);

    if(isset($_REQUEST['items_per_page'])) {
        if($_REQUEST['items_per_page']!='all')
          $_SESSION['items_per_page']=(int)$_REQUEST['items_per_page'];
          else $_SESSION['items_per_page']='all';
    }

    if(isset($_REQUEST['items_sort_order'])) {
      if(in_array($_REQUEST['items_sort_order'],array_map(function($var){return $var['value'];},$filters['items_sort_order'])))
          $_SESSION['items_sort_order']=trim($_REQUEST['items_sort_order']);
    }

    if(!isset($_SESSION['items_per_page'])) $_SESSION['items_per_page'] = 12;
    if(!isset($_SESSION['items_sort_order'])) $_SESSION['items_sort_order'] = 'new';

    if(isset($_REQUEST['isSale']))
      $isSale = true; else
      $isSale = false;

    $TPL['filters_values']=array(
      'items_per_page'=>array_map(function(&$var){if($var['value']==$_SESSION['items_per_page']) $var['active']=true;return $var;},$filters['items_per_page']),
      'items_sort_order'=>array_map(function(&$var){if($var['value']==$_SESSION['items_sort_order']) $var['active']=true;return $var;},$filters['items_sort_order'])
    );

    if(isset($_REQUEST['extra'])){
        $TPL['filters_values']['extra'] = $_REQUEST['extra'];
    }

    if(isset($_REQUEST['collection'])) {$TPL['filters_values']['collection']=array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['collection']));}
    if(isset($_REQUEST['brand'])) {$TPL['filters_values']['brand']=array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['brand']));}
    if(isset($_REQUEST['style'])) {$TPL['filters_values']['style']=array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['style']));}
    if(isset($_REQUEST['type'])) {$TPL['filters_values']['type']=array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['type']));}
    if(isset($_REQUEST['cover'])) {$TPL['filters_values']['cover']=array_unique(array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['cover'])));}
    if(isset($_REQUEST['insert'])) {$TPL['filters_values']['insert']=array_unique(array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['insert'])));}
    if(isset($_REQUEST['size'])) {$TPL['filters_values']['size']=array_unique(array_map(function ($var){return (float)$var;},explode(',',$_REQUEST['size'])));}
    if(isset($_REQUEST['cost'])) {$TPL['filters_values']['cost']=json_decode(trim($_REQUEST['cost']));}
    if(isset($_REQUEST['metals'])) {$TPL['filters_values']['metals']=array_unique(array_map(function ($var){return (int)$var;},explode(',',$_REQUEST['metals'])));}
    
    //$debuglog[]=var_export($_REQUEST,true);
    //make GET URI
    $TPL['getpart']=array();
    foreach($_GET as $k=>$v)
      if(isset($TPL['filters_values'][$k])) $TPL['getpart'][]=$k.'='.$v;
    if($isSale) $TPL['getpart'][]='isSale=true';
    if(count($TPL['getpart'])>0) $TPL['getpart']='?'.implode('&',$TPL['getpart']); else $TPL['getpart']=false;
    //end filters

    $where = '';
    $order = '';
    switch ($_SESSION['items_sort_order']) {
      //case 'casc': $order='order by `cost` asc'; break;
      //case 'cdesc': $order='order by `cost` desc'; break;
      case 'casc': $order='order by `cost_discount` asc'; break;
      case 'cdesc': $order='order by `cost_discount` desc'; break;
      case 'pop':  $order=''; break;
      //case 'new':  $order='order by case `status` when 1 then 0 end'; break;
      case 'new':  $order='order by `art_date` desc'; break;
    }

    $gr_start='';
    if(isset($_GET['type'])) $gr_start='type'; else
    if(isset($_GET['collection'])) $gr_start='collection'; else
    if(isset($_GET['brand'])) $gr_start='brand'; else
    if(isset($_GET['style'])) $gr_start='style';
    if($gr_start!='') {
      $gr_type=(int)$_GET[$gr_start];
      $TPL['pages']['baseurl']='/cat/'.$gr_start.'/'.$gr_type.'/';
      if($gr_type>0) {
              if($gr_start=='style') {
                $res = $db->query('SET SESSION group_concat_max_len = 1000000;');
				$res = $db->query('select group_concat(`id_item`) as `ids` from `items_styles` where `id_styles`='.$gr_type);
                $acceptable_style = $res->fetch_assoc();
                $acceptable_style = $acceptable_style['ids'];
				$rest = substr(trim($acceptable_style), -1);
				if ($rest !== false && $rest == ',')
				{
					$acceptable_style = substr(trim($acceptable_style), 0, -1);
				}
                $where = 'where `id` in ('.$acceptable_style.')';
              } else
              $where = 'where `'.$gr_start.'`="'.$gr_type.'"';
              $TPL['filters_values'][$gr_start.'s']=array($gr_type);
              //$TPL['breadcrumbs'][]=array('name'=>db_get($gr_start.'s',$gr_type),'url'=>'/cat/'.$gr_start.'/'.$gr_type.'.html');
          }else {
              if($gr_start=='style') {
                  $res = $db->query('SET SESSION group_concat_max_len = 1000000;');
				  $res = $db->query('select group_concat(`id_item`) as `ids` from `items_styles`');
                  $acceptable_style = $res->fetch_assoc();
                  $acceptable_style = $acceptable_style['ids'];
					$rest = substr(trim($acceptable_style), -1);
					if ($rest !== false && $rest == ',')
					{
						$acceptable_style = substr(trim($acceptable_style), 0, -1);
					}
                  $where = 'where `id` in ('.$acceptable_style.')';
              } else
              $where = 'where `'.$gr_start.'`>0';
      }
    }
    else {
      if($isSale)
        $TPL['pages']['baseurl']='/cat/collection/sale/'; else
        $TPL['pages']['baseurl']='/cat/';
    }
    
    //закинем фильтры в сессию
    /*if (count($TPL['filters_values']) > 0)
	{
		$testArrKey = array('collection','style','type','cover','insert','brand','size','cost','metals','extra_pop','popular_categ');
		foreach ($testArrKey as &$value) {
			if (isset($TPL['filters_values'][$value]))
			{
				$_SESSION['save_filters_values'][$value] = $TPL['filters_values'][$value];
			}
		}
	}*/
    
    if(isset($_GET['actpage'])) $gr_page=(int)$_GET['actpage']; else $gr_page= 1;
    if(@count($TPL['filters_values']['type'])>0) {
      if($where=='') $where='where '; else $where.=' and ';
      $where .= '(`type` = "'.implode('" and `type` = "',$TPL['filters_values']['type']).'")';
      //$where.='`type` in ('.implode(',',$TPL['filters_values']['type']).')';
    }
    if(@count($TPL['filters_values']['collection'])>0) {
      if($where=='') $where='where '; else $where.=' and ';
      //$where .= '(`collection` = "'.implode('" and `collection` = "',$TPL['filters_values']['collection']).'")';
      $where.='`collection` in ('.implode(',',$TPL['filters_values']['collection']).')';
    }
    if(@count($TPL['filters_values']['brand'])>0) {
      if($where=='') $where='where '; else $where.=' and ';
      $where .= '(`brand` = "'.implode('" and `brand` = "',$TPL['filters_values']['brand']).'")';

    }
    if(@count($TPL['filters_values']['style'])>0) {
      if($where=='') $where='where '; else $where.=' and ';

      $acceptable_style = array();;
      $tmpfilter = array();
      foreach($TPL['filters_values']['style'] as $s)
        $tmpfilter[]='`id_item` in (select `id_item` from `items_styles` where `id_styles` = '.$s.')';
      $res = $db->query('select `id_item` from `items_styles` where '.implode(' and ',$tmpfilter).' group by `id_item`');
      while($row = $res->fetch_assoc()) $acceptable_style[]=$row['id_item'];
//var_dump($acceptable_style);
      //$where .= '(`style` = "'.implode('" and `style` = "',$TPL['filters_values']['style']).'")';
      $where .= '`id` in ('.implode(',',$acceptable_style).')';
      //$where.='`style` in ('.implode(',',$TPL['filters_values']['style']).')';
    }
    if(@count($TPL['filters_values']['cost'])>0) {
      if($where=='') $where='where '; else $where.=' and ';
      $where .= '`cost`>="'.$TPL['filters_values']['cost']->min.'" and `cost` <= "'.$TPL['filters_values']['cost']->max.'"';
    }

    if(@count($TPL['filters_values']['size'])>0) {
        if($where=='') $where='where '; else $where.=' and ';
        $where.='`size` in ('.implode(',',$TPL['filters_values']['size']).')';
    }

    if($isSale) {
        if($where=='') $where='where '; else $where.=' and ';
        $where .= '`discount`>0';
    }

    $tmpf=array();
    $addfil=false;
    if(@count($TPL['filters_values']['cover'])>0) {
      $tmp = array();
      $res = $db->query('select `id_item` from `items_cover` where `id_cover` in ('.implode(',',$TPL['filters_values']['cover']).') group by `id_item` having count(*)='.count($TPL['filters_values']['cover']));
      if($res->num_rows>0) {
        while($row=$res->fetch_assoc()) $tmp[]=$row['id_item'];
      }
      if(count($tmpf)==0) {
        if(!$addfil) $tmpf=$tmp;
      } else $tmpf=array_intersect($tmpf,$tmp);
      $addfil=true;
    }

    if(@count($TPL['filters_values']['metals'])>0) {
        $tmp = array();
        $res = $db->query('select `id_item` from `items_metals` where `id_metals` in ('.implode(',',$TPL['filters_values']['metals']).') group by `id_item` having count(*)='.count($TPL['filters_values']['metals']));
        if($res->num_rows>0) {
            while($row=$res->fetch_assoc()) $tmp[]=$row['id_item'];
        }
        if(count($tmpf)==0) {
            if(!$addfil) $tmpf=$tmp;
        } else $tmpf=array_intersect($tmpf,$tmp);
        $addfil=true;
    }

    //if(@count($TPL['filters_values']['size'])>0) {
    //  $tmp = array();
    //  $res = $db->query('select `id` from `items` where `size` in ('.implode(',',$TPL['filters_values']['size']).')');
    //  if($res->num_rows>0) {
    //    while($row=$res->fetch_assoc()) $tmp[]=$row['id'];
    //  }
    //  if(count($tmpf)==0) {
    //    if(!$addfil) $tmpf=$tmp;
    //  } else $tmpf=array_intersect($tmpf,$tmp);
    //  $addfil=true;
    //}


    if(@count($TPL['filters_values']['insert'])>0) {
      $tmp = array();
      $res = $db->query('select `id_item` from `items_inserts` where `id_inserts` in ('.implode(',',$TPL['filters_values']['insert']).') group by `id_item` having count(*)='.count($TPL['filters_values']['insert']));
      if($res->num_rows>0) {
        while($row=$res->fetch_assoc()) $tmp[]=$row['id_item'];
      }
      if(count($tmpf)==0) {
        if(!$addfil) $tmpf=$tmp;
      } else $tmpf=array_intersect($tmpf,$tmp);
      $addfil=true;
    }

    if($addfil) {
      if($where=='') $where='where '; else $where.=' and ';
      if(count($tmpf)>0) {
        $tmpf = array_unique($tmpf);
        $where.='`id` in ('.implode(',',$tmpf).')';
      } else $where.='`id` is null ';
    }

    if(isset($TPL['filters_values']['extra']) && trim($TPL['filters_values']['extra']) != '') {
        if($where=='') $where='where '; else $where.=' and ';
        $where.="`extra` = '".$TPL['filters_values']['extra']."'";
    }

    if(@is_array($TPL['items'])) {$count=0;} else
    {
      $res = $db->query('select count(*) as c from `items_view` '.$where. ' group by `code` '/*.$order*/);
      $count = (int)@$res->num_rows;
    //содержимое корзины
    $inBasket = array();
    $res = $db->query('SELECT `items_view`.code
                      FROM `basket`,`items_view`
                      where `basket`.`session`="'.session_id().'" and `basket`.`code`=`items_view`.`code`
                      and `items_view`.`size`=`basket`.`size`
                      group by `code`,`items_view`.`size`');
    while($row=$res->fetch_assoc())  {
      $inBasket[] = $row['code'];
    }    
      if($_SESSION['items_per_page']=='all') {
        $sql = 'select *,(min(cost)) as `cost`,(min(cost_discount)) as `cost_discount`,(`art_date`>="'.date("Y-m-d",time()-60*60*24*$cmsVars['newlabel']).'") as `is_new` from `items_view` '.$where.' group by `code` '.$order.' limit '.(($gr_page-1)*12).',12';
      } else {
        $TPL['pages']['total']=(int)ceil($count/$_SESSION['items_per_page']);
        if($gr_page>$TPL['pages']['total']) $gr_page=1;
        $TPL['pages']['active']=$gr_page;
        $sql = 'select *,(min(cost)) as `cost`,(min(cost_discount)) as `cost_discount`,(`art_date`>="'.date("Y-m-d",time()-60*60*24*$cmsVars['newlabel']).'") as `is_new` from `items_view` '.$where.' group by `code` '.$order.' limit '.(($gr_page-1)*$_SESSION['items_per_page']).','.$_SESSION['items_per_page'];
      }
      $TPL['items']=array();
    }

    $res = $db->query($sql);
    if(@$res->num_rows>0) {
      while($row=$res->fetch_assoc()){
        $rate=0;

        if($rate==0) {$rate_caption = 'нет отзывов';}
        elseif($rate==1) {$rate_caption = $rate.' отзыв';}
        elseif($rate<5) {$rate_caption = $rate.' отзыва';}
        elseif($rate>4) {$rate_caption = $rate.' отзывов';}

        if($row['discount']>0) {
          if($row['discount']>50) $row['discount']=0; else
          if($row['discount']%5>0) $row['discount']=0; else
          $row['discount'] = (int)$row['discount'];
        } else $row['discount'] = 0;

        $addon_image = $goods_path.$TPL['types'][$row['type']]['alias'].'/255/'.imagename($row['articul'].'_1');
        if(file_exists($addon_image)) $addon_image='/'.$addon_image; else $addon_image = false;
        $in = (in_array($row['code'], $inBasket) ? 1:0);
        $image = array();
        $imgname = imagename($row['articul'],false);
        $image[]='/'.$goods_path.$TPL['types'][$row['type']]['alias'].'/255/'.$imgname.'.jpg';
        for($i=1;$i<4;$i++) {
          $file_headers = @get_headers('http://fidelis-style.ru/'.$goods_path.$TPL['types'][$row['type']]['alias'].'/big/'.$imgname.'_'.$i.'.jpg');    
          if(file_exists('http://fidelis-style.ru/'.$goods_path.$TPL['types'][$row['type']]['alias'].'/big/'.$imgname.'_'.$i.'.jpg') || $file_headers[0] != 'HTTP/1.1 404 Not Found') {        
            $image[]='/'.$goods_path.$TPL['types'][$row['type']]['alias'].'/255/'.$imgname.'_'.$i.'.jpg';           
          }       
        }         

        $TPL['items'][]=array(
            'url'=>'/item/'.$row['code'].'.html',
            //'image'=>('/'.$goods_path.$TPL['types'][$row['type']]['alias'].'/255/'.preg_replace(array('#/#','# #'),array('_','_'),$row['articul']).'.jpg'),
            'image'=>('/'.$goods_path.$TPL['types'][$row['type']]['alias'].'/255/'.imagename($row['articul'])),
            'image_alt' => $addon_image,
            'cost'=>number_format($row['cost'], 0,'',''),
            'cost_discount'=>number_format($row['cost_discount'],0,'',''),
            'discount'=>$row['discount'],
            'description'=>$row['description'],
            'name'=>$row['name'],
            'status'=>$row['status'],
            'rate'=>0,
            'is_new'=>$row['is_new'],
            'code'=>$row['code'],
            'rate_caption'=>$rate_caption,
            'in'=>$in,
	   'img_slider'=>$image
            );
            
         $items_sizes_code[] = "'".$row['code']."'";  
		 $TPL['size_json'][$row['code']] = '{id: '.$row['id'].'}';
      }
      
        //вот так добавляем размеры
        if (is_array($items_sizes_code) && count($items_sizes_code) > 0)
        {  
            $arrSizeTmp = array(); $idTmp = 0; $codeTmp = 0;
			$res = $db->query('select * from `items_sizes` where code in ('.implode(",", $items_sizes_code).') order by code, size');
			while($row=$res->fetch_assoc()){
				if (!$codeTmp) $codeTmp = $row['code'];
				if (!$idTmp) $idTmp = $row['id_item'];			
				//echo ($row['id_item'] .' -- '.$codeTmp .' -- '.$row['code'] .' | ');
				if ($codeTmp != $row['code'])
				{
					//echo ($row['id_item']);
					//var_dump($arrSizeTmp);
					$TPL['size_json'][$codeTmp] = '{id: '.$idTmp.',sizes: ['.implode(",", $arrSizeTmp).']}';//json_encode($arrSizeTmp);
					$idTmp = $row['id_item'];
					$codeTmp = $row['code'];
					$arrSizeTmp = array();
					$arrSizeTmp[] = '{'.$row['size'].': '.(($row['cost_discount'] > 0 && $row['cost_discount'] != $row['cost']) ? number_format($row['cost_discount'],0,'',''):number_format($row['cost'],0,'','')).'}';
				}
				else 
					$arrSizeTmp[] = '{'.$row['size'].': '.(($row['cost_discount'] > 0 && $row['cost_discount'] != $row['cost']) ? number_format($row['cost_discount'],0,'',''):number_format($row['cost'],0,'','')).'}';
			}
        }      
    }
  //$res = $db->query('select min(cost) as min, max(cost) as max from `items` '/*.$where*/);
  //$row = @$res->fetch_assoc();
  //$TPL['mincost']=$row['min']>0?$row['min']:0;
  //$TPL['maxcost']=$row['max']>0?$row['max']:0;

$avfilters = array(
  'style'=>array(),'type'=>array(),'collection'=>array(),'brand'=>array(),'insert'=>array(),'cover'=>array(),'size'=>array(),'ids'=>array(),'metals'=>array());
$res = $db->query('select * from `items` '.$where);
while($row=$res->fetch_assoc()) {
  $avfilters['style'][$row['style']]=true;
  $avfilters['type'][$row['type']]=true;
  $avfilters['collection'][$row['collection']]=true;
  $avfilters['brand'][$row['brand']]=true;
  $row['size'] = ($row['size']!=floor($row['size'])?number_format($row['size'],1):number_format($row['size'],0));
  $avfilters['size'][$row['size']]=true;
  $avfilters['ids'][]=$row['id'];

}
if(count($avfilters['ids'])>0) {
    $avfilters['ids']=implode(',',$avfilters['ids']);

    $res = $db->query('select `id_inserts` as `id` from `items_inserts` where `id_item` in ('.$avfilters['ids'].')');
    if($res->num_rows>0)
        while($row=$res->fetch_assoc()) $avfilters['insert'][$row['id']]=true;

    $res = $db->query('select `id_cover` as `id` from `items_cover` where `id_item` in ('.$avfilters['ids'].')');
    if($res->num_rows>0)
        while($row=$res->fetch_assoc()) $avfilters['cover'][$row['id']]=true;

    $res = $db->query('select `id_metals` as `id` from `items_metals` where `id_item` in ('.$avfilters['ids'].')');
    if($res->num_rows>0)
        while($row=$res->fetch_assoc()) $avfilters['metals'][$row['id']]=true;

    if(@count($TPL['filters_values']['style'])>0) {

      foreach($TPL['filters_values']['style'] as $s) $avfilters['style'][$s]=true;
      $res = $db->query('select group_concat(`id_styles`) as `styles` from `items_styles` where `id_item` in ('.$avfilters['ids'].') group by `id_item`');
      while($row=$res->fetch_assoc()) {
        $row['styles']=explode(',',$row['styles']);
        $intersect = array_values(array_intersect($row['styles'],$TPL['filters_values']['style']));
        if($intersect==array_values($TPL['filters_values']['style'])) {
          $diff = array_diff($row['styles'],$TPL['filters_values']['style']);
          foreach($diff as $s) $avfilters['style'][$s]=true;
        }
      }
    }else
    {
      $res = $db->query('select `id_styles` as `id` from `items_styles` where `id_item` in ('.$avfilters['ids'].')');
      if($res->num_rows>0)
          while($row=$res->fetch_assoc()) $avfilters['style'][$row['id']]=true;
    }
}

$avfilters['style']=array_keys($avfilters['style']);
$avfilters['type']=array_keys($avfilters['type']);
$avfilters['collection']=array_keys($avfilters['collection']);
$avfilters['brand']=array_keys($avfilters['brand']);
$avfilters['insert']=array_keys($avfilters['insert']);
$avfilters['cover']=array_keys($avfilters['cover']);
$avfilters['size']=array_keys($avfilters['size']);
$avfilters['metals']=array_keys($avfilters['metals']);
unset($avfilters['ids']);
if(isset($emptPopCateg) && $emptPopCateg) {
    $TPL['breadcrumbs'][]=array('name'=>$pop_filter['name'],'url'=>'/popular_categ/'.$emptPopCateg.'.html');
    $TPL['pages']['baseurl']='/popular_categ/'.$emptPopCateg.'/';
    $TPL['pages']['baseurl_first_popular']='/popular_categ/'.$emptPopCateg;
}

ob_start();
$TplEngine->RenderTPL($TplEngine->LoadTPL('ajax_items.html'),$TPL);
$output = array(
                'items'=>preg_replace('#\s{2,}#',' ',ob_get_contents()),
                'count'=>$count,
                'filters'=>$avfilters,
                //'cost'=>array('min'=>$TPL['mincost'],'max'=>$TPL['maxcost']),
                );
//dlog($output['filters']);
if($debug) $output['debug']=implode(",\n",$debuglog);
ob_clean();
$TplEngine->RenderTPL($TplEngine->LoadTPL('ajax_pageswitch.html'),$TPL);
$output['pageswitch']=preg_replace('#\s{2,}#',' ',ob_get_contents());
ob_clean();
ob_end_clean();
?>