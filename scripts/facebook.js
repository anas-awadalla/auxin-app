FB.init({
  appId      : '443237566917005',
  cookie     : true,                     // Enable cookies to allow the server to access the session.
  xfbml      : true,                     // Parse social plugins on this webpage.
  version    : 'v9.0'           // Use this Graph API version for this call.
});

function getFacebookLoginStatus(callback) {
  FB.getLoginStatus(callback(response));
}

function connectToFacebook() {
  FB.login(function(response) {
    if (response.authResponse) {
      // we can retrieve the access token here
      facebookAuthorizedSuccessCallback();
    } else {
      facebookNotAuthorizedFailureCallback();
    }
  }, {"scope": "public_profile,pages_show_list,publish_video,pages_read_engagement,pages_manage_posts"});
}

function postStatusToFacebook(payload) {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      user_id = response.authResponse.userID;
      user_access_token = response.authResponse.accessToken;
      postToPageCallback(user_id, user_access_token, payload, postStatusToFacebookCallback);
    } else {
      facebookNotAuthorizedFailureCallback();
    } 
  });
}

function postMediaToFacebook(payload) {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      user_id = response.authResponse.userID;
      user_access_token = response.authResponse.accessToken;
      postToPageCallback(user_id, user_access_token, payload, postMediaToFacebookCallback);
    } else {
      facebookNotAuthorizedFailureCallback();
    } 
  });
}

function postToPageCallback(user_id, user_access_token, payload, postingCallback) {
  facebookPostInProgressCallback();
  
  FB.api(
    '/' + user_id + '/accounts',
    'GET',
    {
      "fields": "name,access_token",
      "access_token": user_access_token
    },
    function(response) {
        if (!response || response.error) {
          facebookNoPageFailureCallback();
        } else {
          if (response.data.length != 1) {
            facebookNoPageFailureCallback();
          }
          page_access_token = response.data[0].access_token
          page_id = response.data[0].id
          page_name = response.data[0].name
          postingCallback(
            payload = payload,
            page_id = page_id,
            access_token = page_access_token
          );
        }
    }
  );
}

function postMediaToFacebookCallback(payload, page_id, access_token) { 
  let extension = payload['file_url'].split('.').pop();
  if (extension === 'mp4' || extension === 'mov') {
    FB.api(
      '/' + page_id + '/videos',
      'POST',
      {
        "title": payload['title'],
        "description": payload['description'],
        "file_url": payload['file_url'],
        "access_token": access_token,
      },
      function(response) {
        if (!response || response.error) {
          facebookPostFailureCallback();
        } else {
          facebookPostSuccessCallback();
        }
      }
    );
  } else if (extension === 'jpg' || extension === 'jpeg') {
    FB.api(
      '/' + page_id + '/photos',
      'POST',
      {
        "caption": payload['description'],
        "url": payload['file_url'],
        "access_token": access_token,
      },
      function(response) {
        if (!response || response.error) {
          facebookPostFailureCallback();
        } else {
          facebookPostSuccessCallback();
        }
      }
    );
  }
}

function postStatusToFacebookCallback(payload, page_id, access_token) {
  FB.api(
    '/' + page_id + '/feed',
    'POST',
    {
      "message": payload['message'],
      "access_token": access_token
    },
    function(response) {
      if (!response || response.error) {
        facebookPostFailureCallback();
      } else {
        facebookPostSuccessCallback();
      }
    }
  );
}

function facebookPostInProgressCallback() {
  document.getElementById("facebook_status").innerHTML = "Posting...";
}

function facebookPostSuccessCallback() {
  document.getElementById("facebook_status").innerHTML = "Post successful!";
}

function facebookAuthorizedSuccessCallback() {
  document.getElementById("facebook_status").innerHTML = "Authorization successful!";
}

function facebookNotAuthorizedFailureCallback() {
  document.getElementById('facebook_status').innerHTML = 'Please authorize Facebook before posting.';
}

function facebookNoPageFailureCallback() {
  document.getElementById('facebook_status').innerHTML = 'Cannot retrieve Facebook page. Please logging in again.';
}

function facebookPostFailureCallback() {
  document.getElementById('facebook_status').innerHTML = 'Post failed.';
}
