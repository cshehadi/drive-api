
      // The Browser API key obtained from the Google Developers Console.
      var apiKey = 'AIzaSyBrmIh_QbGVjEojoBmkRTh7Ue0vH70izXk';

      // The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
      var clientId = "182401266382-366sj3a9m2nf7kgn0dpq977qurkljodd.apps.googleusercontent.com"

      // Scope to use to access user's photos.
      var scopes = ['https://www.googleapis.com/auth/drive.readonly'];

      var auth2;

      var pickerApiLoaded = false;
      var oauthToken;

      // Use the API Loader script to load google.picker and gapi.auth.
      function onApiLoad() {
        gapi.load('client:auth2:picker', {'callback': initAuth});
      }

      function initAuth() {
          gapi.client.setApiKey(apiKey);
          gapi.auth2.init({
              client_id: clientId,
              scope: scopes.join(' '),
              immediate: false,
          }).then(function () {
            auth2 = gapi.auth2.getAuthInstance();
            auth2.signIn().then(function () {
                oauthToken = auth2.currentUser.get().hg.access_token;
                onPickerApiLoad();
            });
          });
      }

      function onPickerApiLoad() {
        pickerApiLoaded = true;
        createPicker();
      }

      function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          oauthToken = authResult.access_token;
          createPicker();
        }
      }

      // Create and render a Picker object for picking user Photos.
      function createPicker() {
        if (pickerApiLoaded && oauthToken) {
          var picker = new google.picker.PickerBuilder().
              addView(google.picker.ViewId.DOCUMENTS).
              setOAuthToken(oauthToken).
              setCallback(pickerCallback).
              build();
          picker.setVisible(true);
        }
      }

    function handleImport(data) {
        $('#result').html(data);
    }

    function pickerCallback(data) {
      if (data.action == google.picker.Action.PICKED) {

        var fileId = data.docs[0].id;
        var mimeType = data.docs[0].mimeType;
        var export_data;

        if (mimeType == 'application/vnd.google-apps.document') {
            export_data = {mimeType: 'text/html', key: apiKey};
            $.ajax({
                    url: 'https://www.googleapis.com/drive/v3/files/'+fileId+'/export', 
                    data: export_data, 
                    beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer '+oauthToken); },
                    success: handleImport 
                });
        } else {
            $('#result').html('<p><strong>Sorry</strong> - at this time we can only import documents that were <em>created</em> in Google Docs.  This document seems to have been created in another application and uploaded to Google Docs.</p>');
/*          // use this code to download a non-google doc.  You'll need some method to convert it to html
            gapi.client.load('drive', 'v3', function() {
                var request = gapi.client.drive.files.get({
                  fileId: fileId,
                  alt: 'media'
                }).then(function(file) {
                    // send to submission server?
                });
            }); */
        }
      }
    }
