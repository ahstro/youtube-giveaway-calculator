(function () {
  'use strict';

  function getIdFromUrl (url, opts) {
    if (opts == undefined) {
      opts = { fuzzy: true };
    }

    if (/youtu\.?be/.test(url)) {

      // Look first for known patterns
      var i;
      var patterns = [/youtu\.be\/([^#\&\?]{11})/, // youtu.be/<id>
      /\?v=([^#\&\?]{11})/, // ?v=<id>
      /\&v=([^#\&\?]{11})/, // &v=<id>
      /embed\/([^#\&\?]{11})/, // embed/<id>
      /\/v\/([^#\&\?]{11})/ // /v/<id>
      ];

      // If any pattern matches, return the ID
      for (i = 0; i < patterns.length; ++i) {
        if (patterns[i].test(url)) {
          return patterns[i].exec(url)[1];
        }
      }

      if (opts.fuzzy) {
        // If that fails, break it apart by certain characters and look
        // for the 11 character key
        var tokens = url.split(/[\/\&\?=#\.\s]/g);
        for (i = 0; i < tokens.length; ++i) {
          if (/^[^#\&\?]{11}$/.test(tokens[i])) {
            return tokens[i];
          }
        }
      }
    }

    return null;
  };

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var URL = 'https://www.youtube.com/watch?v=jPZZAavOugo';
  var YOUTUBE_API_KEY = 'AIzaSyDc9FiNUYZ68YCCv90rdQiRjDtl_I4Y3l0';
  var MAX_RESULTS = 100;
  var BASE_API_URL = 'https://www.googleapis.com/youtube/v3/commentThreads?part=id%2Csnippet&maxResults=' + MAX_RESULTS + '&key=' + YOUTUBE_API_KEY;

  function getCommenters(comments) {
    // Reduce the comments array to an map of ids to
    // display names by destructuring the comment objects
    // This has the added bonus only letting each user
    // appear once, since the id/key is overwritten if
    // it occurs multiple times
    return comments.reduce(function (t, _ref) {
      var _ref$snippet$topLevel = _ref.snippet.topLevelComment.snippet;
      var authorDisplayName = _ref$snippet$topLevel.authorDisplayName;
      var authorChannelUrl = _ref$snippet$topLevel.authorChannelUrl;
      return _extends({}, t, defineProperty({}, authorChannelUrl, authorDisplayName));
    }, {});
  }

  function getApiUrl(videoId, pageToken) {
    return pageToken ? BASE_API_URL + '&videoId=' + videoId + '&pageToken=' + pageToken : BASE_API_URL + '&videoId=' + videoId;
  }

  function setResult(_ref2) {
    var name = _ref2.name;
    var url = _ref2.url;

    var markup = '<a href=' + url + '>' + name + '</a>';
    var elem = document.getElementById('result');
    elem.innerHTML = 'The winner is: ' + markup;
    document.getElementById('loading').style.display = 'none';
    elem.style.display = 'block';
  }

  function getResult(commenters) {
    var keys = Object.keys(commenters);
    var rand = Math.floor(Math.random() * keys.length);
    var key = keys[rand];
    return {
      name: commenters[key],
      url: key
    };
  }

  function loading() {
    document.getElementById('result').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
  }

  function getWinner() {
    loading();
    var videoId = getIdFromUrl(URL);
    var commenters = {};

    function getData(apiUrl) {
      window.fetch(apiUrl).then(function (res) {
        return res.status === 200 && res.json();
      }).then(function (json) {
        if (!json) {
          document.getElementById('loading').innerHTML = 'Something went wrong..';
          return null;
        }
        var nextPageToken = json.nextPageToken;
        var items = json.items;

        commenters = _extends({}, commenters, getCommenters(items));
        if (nextPageToken) {
          console.log(Object.keys(commenters).length, ' potential winners so far');
          getData(getApiUrl(videoId, nextPageToken));
        } else {
          var result = getResult(commenters);
          console.log('A winrar is ', result.name, '! ', result.url);
          setResult(result);
        }
      });
    }

    getData(getApiUrl(videoId));
  }

  document.getElementById('button').addEventListener('click', getWinner);

}());