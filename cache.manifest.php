<?php
    date_default_timezone_set('Europe/Moscow');
    
    @$config=simplexml_load_file('cache.manifest.xml');
    
    if (!isset($config->cache)) respond404();

    $result="CACHE MANIFEST\n";
    $lastModified=0;

    foreach ($config->cache as $cache)
        foreach ($cache->file as $fname){
            $filename=$fname[0];
            if (file_exists($filename)) {
                $ftime=filemtime($filename);
                if ($ftime>$lastModified) $lastModified=$ftime;
                $result .= "\n# ".date ("M d Y H:i:s", $ftime)."\n".str_replace(' ', '%20', $filename);
            }
        }
    
    $result .="\n\nNETWORK:\n*\n";
    
    $eTag=md5($result);
    
    header('ETag: '.$eTag."\n");
    
    $headers = apache_request_headers();
            
    $modified=true;

    foreach ($headers as $header => $value) switch($header){
        case 'If-None-Match':
            if ($eTag==$value) $modified=false;
            //$result .= "\n#".$header.':'.$value.' Etag: '.$eTag;
            //if (!$modified) $result .= "\n#!Modified";
            break;
        case 'If-Modified-Since':
            if (strtotime($value) > $lastModified) $modified=false;
            //$result .= "\n#".$header.':'.$value.' Last-modifed: '.date("r", $lastModified ).' ('.strtotime($value) .','. $lastModified.')';
            //if (!$modified) $result .= "\n#!Modified";
            break;
    }
    
    header('Content-Type: text/cache-manifest');
    header('Last-Modified: '. date("r", $lastModified ) );
    
    //if (!$modified) $result .= "\n#!Modified";

    //file_put_contents ('response.txt', $result);

    if (!$modified) {
        header($_SERVER["SERVER_PROTOCOL"]." 304 Not Modified\n");
    } else {
        print $result;
    }


    function respond404(){
        header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
        header('Content-Type:text/html; charset=iso-8859-1',replace,404);
        die('<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL '.$_SERVER['REQUEST_URI'].' was not found on this server.</p>
</body></html>
');
    }
    
?>