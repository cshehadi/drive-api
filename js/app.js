"use strict";

$(document).ready(function() {

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

      // set up authorization - call the picker once you're authorized
      function initAuth() {
          gapi.client.setApiKey(apiKey);
          gapi.auth2.init({
              client_id: clientId,
              scope: scopes.join(' '),
              immediate: false,
          }).then(function () {
            auth2 = gapi.auth2.getAuthInstance();
            auth2.signIn().then(function () {
                oauthToken = auth2.currentUser.get().getAuthResponse().access_token; // save the oauthtoken - you'll need it soon
                onPickerApiLoad();
            });
          });
      }

      // once we're authorized and ready, open up the picker
      function onPickerApiLoad() {
        pickerApiLoaded = true;
        createPicker();
      }

      // Create and render a Picker object for picking user Photos.
      function createPicker() {
        if (pickerApiLoaded && oauthToken) {
          var view = new google.picker.DocsView(google.picker.ViewId.DOCUMENTS)
              .setMode(google.picker.DocsViewMode.GRID);
          var picker = new google.picker.PickerBuilder()
              .addView(view)
              .enableFeature(google.picker.Feature.NAV_HIDDEN)
              .setOAuthToken(oauthToken)
              .setCallback(pickerCallback)
              .build();
          picker.setVisible(true);
        }
      }

    function pickerCallback(data) {
      if (data.action == google.picker.Action.PICKED) {

        var fileId = data.docs[0].id;
        var mimeType = data.docs[0].mimeType;
        var export_data;

        // if it's a native google doc (rather than an uploaded doc of another type, such as an ms-word doc)
        if (mimeType == 'application/vnd.google-apps.document') {
            export_data = {mimeType: 'text/html', key: apiKey};
            // go get it
            $.ajax({
                    url: 'https://www.googleapis.com/drive/v3/files/'+fileId+'/export', 
                    data: export_data, 
                    beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer '+oauthToken); },
                    success: handleGoogleDocImport 
                });
        } else { // ms word doc - or other document type - for now throw an error
            var headline = 'Sorry';
            var message = 'At this time we can only import documents that were <em>created</em> in Google Docs.  This document seems to have been created in another application and uploaded to Google Docs.  Please try another document.';
            displayError(headline, message);
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


    function displayError(headline, message) {
        $('#error').html('<p><strong>'+headline+'</strong><br>'+message+'</p>');
        $('#error').show();
    }

    function clearError() {
        $('#error').hide();
        $('#error').html('');
    }

    /* functions for handling the import */


    function newClassName(idx) {
        return 'gww_'+idx;
    }

    function lookupStyle(style, styles) {
        // search the styles array, checking for this particular style string...
        return styles.find(function(style_item) { 
                                return style_item.style == style;
                            });
    }

    function generateStyles(html) {
        
        var styles = [];
        var style_idx = 0;

        // put the html into the DOM so we can manipulate it more easily
        // jquery will automatically remove html, header, title and body tags
        $('#sandbox').html(html);

        // loop through all the elements - looking for style attributes
        // we're going to convert them to styles
        $('#sandbox *').each(function() {
            var style = $(this).attr('style');
            if (style !== undefined) { // if this element has a style attribute...
                var style_name = '';

                // check to see if we've defined this style already
                var saved_style = lookupStyle(style, styles);

                if (saved_style) { // if we've defined it, then get the style name
                    style_name = saved_style.style_name;
                } else {
                    style_name = newClassName(++style_idx); // otherwise, make a new style name...
                    styles.push({style_name: style_name, style: style}); // and save it, so you don't define it twice
                }

                $(this).removeAttr('style');  // remove the style attribute
                $(this).addClass(style_name); // replace it with a class
            }
        });

        // now that we've build our array of new styles - add them to the style tag
        $.each(styles,function() {
            $('#sandbox style').append("\n."+this.style_name+'{'+this.style+'}');
        });

        // clear out the sandbox, and return the html
        html = $('#sandbox').html();
        $('#sandbox').html('');

        return html;
    }

    function handleGoogleDocImport(data) {
        var html = generateStyles(data);
        $('#submission').append(html);
        $('#submission-wrapper').show();
    }

    /*** EVENT HANDLERS ***/

    $('#pick-file').click(function() {
        clearError();
        if(typeof gapi.client === 'object') {
            onPickerApiLoad();
        } else {
            onApiLoad();
        }
    });

    $('#delete-submission').click(function() {
        $('#submission').html('');
        $('#submission-wrapper').hide();
    });
});
