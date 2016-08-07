/**
 * Config Object
 */
var config = {
  youtubeApiKey: 'API_KEY',
  youtubeApiIframe: 'https://www.youtube.com/iframe_api',
  youtubeApiSearch: '',
  youtubeApiVideo: ''
}
config.youtubeApiSearch = 'https://www.googleapis.com/youtube/v3/search?key=' + config.youtubeApiKey;

var searchParams = {
  // default search params
  part: 'id, snippet',
  order: '',
  maxResults: 9,
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
    height: '488',
    width: '800',
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  // focus on search input
  $('#search-box').focus();
  // catch the event on the video image and play it to the youtube player
  $(document).on("click", ".videoThumbnail, .description", function (event) {
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
        $('.add-img').show();
        searchParams.nextPageToken = data.nextPageToken;
        searchParams.previousPageToken = data.prevPageToken;
      }.bind(this));
    }
    $('.spinner').removeClass('loader');
    $('.add-img').show();
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
    $('.add-img').hide();
    timer = setTimeout(this.queryForVideos, 500);
  },
  componentDidMount: function () {
    $(document).on('keyup', '#search-box', this.setQueryParams);
    $(document).on('change', '#order-select', this.setQueryParams);
  },
  render: function () {
    return (
      <div className="videoBox">
        <div className="btn-box col-md-offset-6 col-md-6 clearfix">
          <button onClick={this.setQueryParams} className="btn btn-default next fetch-next-prev pull-right"></button>
          <button onClick={this.setQueryParams} className="btn btn-default prev fetch-next-prev pull-right"></button>
        </div>
        <div className=" col-md-12">
          <div className="spinner">
            <VideoList data={this.state.data} />
          </div>
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
  getInitialState: function () {
    return {
      add_img: '../images/add.png'
    };
  },
  render: function () {
    var datum = this.props.datum;
    return (
      <div className="video" data-video-id={datum.id.videoId}>
        <p className="description">{datum.snippet.title}</p>
        <img className="videoThumbnail" src={datum.snippet.thumbnails.high.url}/>
        <img className="add-img" src={this.state.add_img}/>
      </div>
    );
  }
});

ReactDOM.render(
  <VideoBox />,
  document.getElementById('video-box')
);