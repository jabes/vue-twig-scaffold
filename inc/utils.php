<?php

class Utils
{

  const ASSETS_PATH = 'assets/dist';

  /**
   * @param $basename string
   * @return string
   */
  static function get_asset_path($basename)
  {
    return Utils::ASSETS_PATH . '/' . $basename;
  }

  /**
   * Check to see if a given url is accessible
   * @param $url string
   * @return bool
   */
  static function url_exists($url)
  {
    $fp = curl_init($url);
    if (!$fp) return false;
    return true;
  }

  /**
   * Embed an SVG
   * @param $filename string
   * @param $classes array
   * @param $sizes array|null
   * @return string
   */
  static function embed_svg($filename, array $classes = [], array $sizes = null)
  {
    $path = Utils::ASSETS_PATH . "/img/{$filename}.svg";
    $svg = file_get_contents($path);
    $classes[] = 'svg-container';
    $classes[] = $filename;
    $attributes = [];
    $attributes['class'] = implode(' ', $classes);
    if ($sizes) {
      $width = $sizes[0];
      $height = $sizes[1] ?? $width;
      $attributes['style'] = implode('; ', [
        "width:{$width}",
        "height:{$height}",
      ]);
    }
    $attributes = implode(
      array_map(
        static function ($value, $key) {
          return sprintf('%s="%s"', $key, $value);
        },
        array_values($attributes),
        array_keys($attributes)
      ),
      ' '
    );
    return "<span {$attributes}>{$svg}</span>";
  }

  /**
   * Capture output buffer
   * @param callable $callback A method to execute that will produce output to capture
   * @return string
   */
  static function get_output_buffer(callable $callback)
  {
    ob_start();
    $callback();
    $html = ob_get_contents();
    ob_end_clean();
    return $html;
  }

  /**
   * Function used to create a url friendly slug from any string
   * @param $text string The string to convert into a slug
   * @return string
   */
  static function slugify($text)
  {
    // replace non letter or digits by -
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    // transliterate
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    // remove unwanted characters
    $text = preg_replace('~[^-\w]+~', '', $text);
    // trim
    $text = trim($text, '-');
    // remove duplicate -
    $text = preg_replace('~-+~', '-', $text);
    // lowercase
    $text = strtolower($text);
    return $text;
  }

  /**
   * Apply a character limit to a string
   * @param string $str String to get an excerpt from
   * @param integer $startPos Position int string to start excerpt from
   * @param integer $maxLength Maximum length the excerpt may be
   * @return string
   */
  static function char_limit($str, $startPos = 0, $maxLength = 160)
  {
    $excerpt = $str;
    if (strlen($str) > $maxLength) {
      $excerpt = substr($str, $startPos, $maxLength - 3);
      $lastSpace = strrpos($excerpt, ' ');
      $excerpt = substr($excerpt, 0, $lastSpace);
      $excerpt .= '...';
    }
    return $excerpt;
  }

  /**
   * Apply a word limit to a string
   * @param string $str The string to get an excerpt from
   * @param integer $limit The number of words to allow
   * @param string $after A string to append at the end
   * @return string
   */
  static function word_limit($str, $limit = 20, $after = '...')
  {
    if (str_word_count($str, 0) > $limit) {
      $words = str_word_count($str, 2);
      $pos = array_keys($words);
      $str = substr($str, 0, $pos[$limit]) . $after;
    }
    return $str;
  }

  static function find_needles_in_haystack($haystack, array $needles, $offset = 0)
  {
    $chr = [];
    foreach ($needles as $needle) {
      $res = strpos($haystack, $needle, $offset);
      if ($res !== false) $chr[$needle] = $res;
    }
    return $chr;
  }

  static function date_diff($start_date, $end_date)
  {
    if (ctype_digit($start_date)) $start_date = date("c", $start_date);
    if (ctype_digit($end_date)) $end_date = date("c", $end_date);
    $a = new DateTime($start_date);
    $b = new DateTime($end_date);
    $diff = $a->diff($b);
    return $diff;
  }

  static function is_date_range_current($start_date, $end_date)
  {
    $today = strtotime(date('Y-m-d'));
    $start = strtotime($start_date);
    $end = strtotime($end_date);
    return (
      ($today >= $start) &&
      ($today <= $end)
    );
  }

  static function is_date_range_future($start_date, $end_date)
  {
    $today = strtotime(date('Y-m-d'));
    $start = strtotime($start_date);
    $end = strtotime($end_date);
    return (
      ($today < $start) &&
      ($today < $end)
    );
  }

  static function is_date_range_past($start_date, $end_date)
  {
    $today = strtotime(date('Y-m-d'));
    $start = strtotime($start_date);
    $end = strtotime($end_date);
    return (
      ($today > $start) &&
      ($today > $end)
    );
  }

  static function relative_timestamp($ts, $default_format = 'M j, Y')
  {
    if (!ctype_digit($ts)) {
      $ts = strtotime($ts);
    }
    $diff = time() - $ts;
    if ($diff == 0) {
      return 'Now';
    } elseif ($diff > 0) {
      $day_diff = floor($diff / 86400);
      if ($day_diff == 0) {
        if ($diff < 60) return 'Just now';
        if ($diff < 120) return '1 minute ago';
        if ($diff < 3600) return floor($diff / 60) . ' minutes ago';
        if ($diff < 7200) return '1 hour ago';
        if ($diff < 86400) return floor($diff / 3600) . ' hours ago';
      }
      if ($day_diff == 1) return 'Yesterday';
      if ($day_diff < 7) return $day_diff . ' days ago';
      if ($day_diff < 31) return ceil($day_diff / 7) . ' weeks ago';
      if ($day_diff < 60) return 'Last month';
      return date($default_format, $ts);
    } else {
      $diff = abs($diff);
      $day_diff = floor($diff / 86400);
      if ($day_diff == 0) {
        if ($diff < 120) return 'In a minute';
        if ($diff < 3600) return 'In ' . floor($diff / 60) . ' minutes';
        if ($diff < 7200) return 'In an hour';
        if ($diff < 86400) return 'In ' . floor($diff / 3600) . ' hours';
      }
      if ($day_diff == 1) return 'Tomorrow';
      if ($day_diff < 4) return date('l', $ts);
      if ($day_diff < 7 + (7 - date('w'))) return 'Next week';
      if (ceil($day_diff / 7) < 4) return 'In ' . ceil($day_diff / 7) . ' weeks';
      if (date('n', $ts) == date('n') + 1) return 'Next month';
      return date($default_format, $ts);
    }
  }

}
