/* 
* For calling Google Voice numbers
* Version 0.3
*/

var noun_type_googlevoiceconfig = {
    _name: "google voice config",
    
    hasKey: function(key) {
        return Application.prefs.has("google_voice_key");
    },
    
    setKey: function(key) {
        if (!Application.prefs.has("google_voice_key")) {
            Application.prefs.setValue("google_voice_key", key);
        } else {
            var new_key = Application.prefs.get("google_voice_key");
            new_key.value = key;
            return new_key.value;
        }
    },

    getKey: function(text, html) {
        var suggestions = [];
        var key = Application.prefs.get("google_voice_key");
        return key.value;
    },

    setPhone: function(phone) {
        if (!Application.prefs.has("google_voice_phone")) {
            Application.prefs.setValue("google_voice_phone", phone);
        } else {
            var new_phone = Application.prefs.get("google_voice_phone");
            new_phone.value = phone;
            return new_phone.value;
        }
    },

    hasPhone: function(phone) {
        return Application.prefs.has("google_voice_phone");
    },
    
    getPhone: function(text,html) {
        var suggestions = [];
        var phone = Application.prefs.get("google_voice_phone");
        return phone.value;
    }
}

function cleanNumber(phonenum) {
    phonenum = phonenum.replace(/[A-Ca-c]/g,"2").replace(/[D-Fd-f]/g,"3").replace(/[G-Ig-i]/g,"4").replace(/[J-Lj-l]/g,"5").replace(/[M-Om-o]/g,"6").replace(/[P-Sp-s]/g,"7").replace(/[T-Vt-v]/g,"8").replace(/[W-Zw-z]/g,"9");
    phonenum = phonenum.replace(/[^0-9]/g,"");
    if (phonenum.substring(0,1) == "1")
      phonenum = phonenum.substring(1,phonenum.length);
    return phonenum;
}

function formatNumber(phonenum) {
    var formatted = phonenum;
    if (phonenum.length == 10)
      formatted = "("+phonenum.substring(0,3)+") "+phonenum.substring(3,6)+"-"+phonenum.substring(6,10);
    return formatted;
}

CmdUtils.CreateCommand({
  // todo: set a default number and add an optional "from" argument for alternate numbers
  names: ["call", "google voice call"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "number to call"}],
  description: "Calls a selected/entered number using Google Voice. You must be logged into Google Voice and have configured the Ubiquity command with the 'google voice setkey' and 'google voice setphone' commands. For numbers other than 10 digits, be sure to include the country code.",
  author: {name: "earth2marsh", email: "marsh.gardiner@gmail.com"},
  license: "MIT",

  preview: function(pb, {object: {text}}) {
     var gvkey = noun_type_googlevoiceconfig.getKey();
     if (gvkey) {
           pb.innerHTML = (text
                    ? (<><b>Calling:</b> 
                      {formatNumber(cleanNumber(text))}<br /><br />
                      <b>From:</b> {formatNumber(noun_type_googlevoiceconfig.getPhone())}<br /><br /><br />
                      <i><b>Having trouble?</b></i><ol><li>Check that you are logged in to <a href="http://google.com/voice">Google Voice</a></li><li>then verify your configuration with 'google voice configcheck'.</li></ol> </>)
                    : this.description);
     }
     else
           pb.innerHTML = "You must be logged into <a href='http://google.com/voice'>Google Voice</a> and have configured this command with 'google voice setkey' and 'google voice setphone'.";
  },

  execute: function({object: {text}}) {
     var gvkey = noun_type_googlevoiceconfig.getKey();
     var tocall = cleanNumber(text);
     var prefix = "";
     if (tocall.length == 10)
        prefix = "+1";
     if (gvkey) {
          //need to do error checking on number
          jQuery.post("https://www.google.com/voice/m/sendcall", { _rnr_se: gvkey, number: prefix+tocall, phone: '+1'+noun_type_googlevoiceconfig.getPhone()} );
          displayMessage(_("Calling: "+formatNumber(tocall)+" With: "+formatNumber(noun_type_googlevoiceconfig.getPhone())));
    } else {
      displayMessage(_("No number to call or not configured."));
    }
  }

});

CmdUtils.CreateCommand({
  names: ["google voice setphone"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "Your phone number ###-###-####."}],
  description: "Google Voice will call you at this number.",
  author: {name: "earth2marsh", email: "marsh.gardiner@gmail.com"},
  license: "MIT",

  preview: function(pb, {object: {text}}) {
    pb.innerHTML = (text
                    ? (<>Your phone number: {formatNumber(cleanNumber(text))}</>)
                    : this.description);
  },

  execute: function({object: {text}}) {
    if (text) {
          noun_type_googlevoiceconfig.setPhone(cleanNumber(text));
          displayMessage( "Google Voice will call you at " + formatNumber(cleanNumber(text)) );
    } 
    else
      displayMessage("No phone number entered.");

  }
});

CmdUtils.CreateCommand({

  names: ["google voice setkey"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "Finds and stores your Google Voice key."}],
  description: "You must already be logged in to Google Voice!",
  author: {name: "earth2marsh", email: "marsh.gardiner@gmail.com"},
  license: "MIT",

  preview: function(pb, {object: {text}}) {
    pb.innerHTML = "Looking up your key...";

    Utils.parseRemoteDocument(
      "https://www.google.com/voice#inbox", // URL
      null, // post data
      function(doc) { // success callback
        var gvkey = jQuery("input[name='_rnr_se']", doc).attr("value");
        if (gvkey) {
          pb.innerHTML = "Your key is: " + gvkey + "<br />Press enter to save it.";
          
        }
        else
          pb.innerHTML = "Error: Check that you are logged in to <a href='http://google.com/voice'>Google Voice</a>.";
      }
    ); 
  },

  execute: function({object: {text}}) {
    Utils.parseRemoteDocument(
      "https://www.google.com/voice#inbox", // URL
      null, // post data
      function(doc) { // success callback
        var gvkey = jQuery("input[name='_rnr_se']", doc).attr("value");
        if (gvkey) {
          noun_type_googlevoiceconfig.setKey(gvkey);
          displayMessage("Google Voice Key stored!");
        }
        else
          displayMessage("Error: Check that you are logged in to Google Voice.");
      }
    ); 

  }
});

CmdUtils.CreateCommand({
  names: ["google voice configcheck"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "Displays configuration information."}],
  description: "Displays Google Voice command configuration information.",
  author: {name: "earth2marsh", email: "marsh.gardiner@gmail.com"},
  license: "MIT",

  preview: function(pb, {object: {text}}) {
    var yourphone = noun_type_googlevoiceconfig.getPhone();
    var yourkey = noun_type_googlevoiceconfig.getKey();
    var message = "";
    if (yourphone)
       message = "<b>Will call you at:</b> "+formatNumber(yourphone)+"<br /><i>use 'google voice setphone' to change</i><br /><br />";
    else
       message = "<b>Error:</b> you have not set a number for receiving calls. Use 'google voice setphone'.<br /><br />";
    if (yourkey)
       message = message + "<b>Your key is:</b> "+yourkey+"<br /><i>to reset, log in to <a href='http://google.com/voice'>Google Voice</a> and use the 'google voice setkey' command</i><br />";
    else
       message = message + "<b>Error:</b> no Google Voice key set. <i>Log in to <a href='http://google.com/voice'>Google Voice</a> and then use the 'google voice setkey' command.</i><br />";
    pb.innerHTML = message + "<br />Need help? Try the <i><a href='http://earth2marsh.com/ubiquity/googlevoice'>Troubleshooting steps</a></i>";
  },

  execute: function({object: {text}}) {
  }
});