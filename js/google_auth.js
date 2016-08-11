
      // The Browser API key obtained from the Google Developers Console.
      var developerKey = 'AIzaSyBrmIh_QbGVjEojoBmkRTh7Ue0vH70izXk';

      // The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
      var clientId = "182401266382-366sj3a9m2nf7kgn0dpq977qurkljodd.apps.googleusercontent.com"

      // Scope to use to access user's photos.
      var scope = ['https://www.googleapis.com/auth/drive.readonly'];

      var pickerApiLoaded = false;
      var oauthToken;

      // Use the API Loader script to load google.picker and gapi.auth.
      function onApiLoad() {
        gapi.load('auth', {'callback': onAuthApiLoad});
        gapi.load('picker', {'callback': onPickerApiLoad});
      }

      function onAuthApiLoad() {
        window.gapi.auth.authorize(
            {
              'client_id': clientId,
              'scope': scope,
              'immediate': false
            },
            handleAuthResult);
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
              setDeveloperKey(developerKey).
              setOrigin(window.location.protocol + '//' + window.location.host).
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
            export_data = {mimeType: 'text/html', key: developerKey};
            $.get('https://www.googleapis.com/drive/v3/files/'+fileId+'/export', export_data, handleImport);
        } else {
            export_data = {key: developerKey};
            $.get('https://www.googleapis.com/drive/v3/files/0B5qjOodUtEthZENxS1VUQlByX3c')
            $.get('https://www.googleapis.com/drive/v3/files/'+fileId, export_data, function(data) { console.log(data); });
        }
      }
    }
