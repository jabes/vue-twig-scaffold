<?php

require_once 'vendor/autoload.php';
require_once 'inc/utils.php';

$loader = new Twig_Loader_Filesystem('templates');
$twig = new Twig_Environment($loader);

$twig->addFunction(new Twig_Function('asset', 'Utils::get_asset_path'));
$twig->addFunction(new Twig_Function('image', 'Utils::get_image_path'));
$twig->addFunction(new Twig_Function('svg', 'Utils::embed_svg'));

$twig->addFilter(new Twig_Filter('slugify', 'Utils::slugify'));
$twig->addFilter(new Twig_Filter('char_limit', 'Utils::char_limit'));
$twig->addFilter(new Twig_Filter('word_limit', 'Utils::word_limit'));
$twig->addFilter(new Twig_Filter('relative_timestamp', 'Utils::relative_timestamp'));

$template = $twig->load('page-home.twig');
echo $template->render([
  'site' => [
    'name' => 'Control Demo',
    'url' => 'http://localhost:8000/',
  ],
]);
