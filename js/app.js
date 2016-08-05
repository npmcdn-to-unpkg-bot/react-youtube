/**
 * Config Object
 */
var config = {
  youtubeApiKey: 'AIzaSyA2zb_q0cGcLsNXi6KcIGysf9OAb6YCS88',
  youtubeApiIframe: 'https://www.youtube.com/iframe_api',
  youtubeApiSearch: '',
  youtubeApiVideo: ''
}
config.youtubeApiSearch = 'https://www.googleapis.com/youtube/v3/search?key=' + config.youtubeApiKey;

var searchParams = {
  // default search params
  part: 'id, snippet',
  order: '',
  maxResults: 16,
  videoEmbeddable: true,
  type: 'video',
  q: '',
  nextPageToken: '',
  previousPageToken: '',
  pageToken: ''
}

$(document).on('submit', '.search', function (event) {
  event.preventDefault();
});

// Video Player
var tag = document.createElement('script');

tag.src = config.youtubeApiIframe;
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//    This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  // catch the event on the video image and play it to the youtube player
  $(document).on("click", ".videoThumbnail", function (event) {
    var videoId = $(this).parents('.video').attr('data-video-id');
    player.loadVideoById({
      'videoId': videoId,
      'suggestedQuality': 'large'
    });
  });
}

// Video container
var VideoBox = React.createClass({
  getInitialState: function () {
    return {
      data: []
    };
  },
  queryForVideos: function () {
    if (searchParams.q) {
      $.getJSON(config.youtubeApiSearch + '&' + $.param(searchParams), function (data) {
        this.setState({ data: data.items });
        $('.spinner').removeClass('loader');
        searchParams.nextPageToken = data.nextPageToken;
        searchParams.previousPageToken = data.prevPageToken;
      }.bind(this));
    }
    $('.spinner').removeClass('loader');
  },
  setQueryParams: function (event) {
    var timer;
    var element = $(event.target);
    searchParams.q = $('#search-box').val();
    searchParams.order = $('#order-select').val();
    searchParams.pageToken = '';
    if (element.is('.fetch-next-prev')) {
      searchParams.pageToken = (element.is('.prev')) ? searchParams.previousPageToken : searchParams.nextPageToken;
    }
    clearTimeout(timer);
    $('.spinner').addClass('loader');
    timer = setTimeout(this.queryForVideos, 500);
  },
  componentDidMount: function () {
    $(document).on('keyup', '#search-box', this.setQueryParams);
    $(document).on('change', '#order-select', this.setQueryParams);
  },
  render: function () {
    return (
      <div className="videoBox">
        <button onClick={this.setQueryParams} className="btn btn-default prev fetch-next-prev">Previous</button>
        <button onClick={this.setQueryParams} className="btn btn-default next fetch-next-prev">Next</button>
        <div className="spinner">
          <VideoList data={this.state.data} />
        </div>
      </div>
    );
  }
});

// Video list
var VideoList = React.createClass({
  render: function () {
    var count = 0;
    return (
      <div className="videoList">
        {this.props.data.map(function (datum) {
          count++;
          return <Video key={count} datum={datum} />
        }) }
      </div>
    );
  }
});

// Video
var Video = React.createClass({
  render: function () {
    var datum = this.props.datum;
    return (
      <div className="video" data-video-id={datum.id.videoId}>
        <p className="description">{datum.snippet.title}</p>
        <img className="videoThumbnail" src={datum.snippet.thumbnails.high.url}/>
      </div>
    );
  }
});

ReactDOM.render(
  <VideoBox />,
  document.getElementById('video-box')
);