/* 
* For calling Google Voice numbers
* Version 0.2
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
    return phonenum.replace(/[^0-9]/g,"");
}

function formatNumber(phonenum) {
    return "+1 ("+phonenum.substr(0,3)+") "+phonenum.substr(3,3)+"-"+phonenum.substr(6,4);
}

CmdUtils.CreateCommand({
  // todo: set a default number and add an optional "from" argument for alternate numbers
  names: ["call"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "number to call"}],
  description: "Calls a selected/entered number using Google Voice. Must be configured with the 'google voice setkey' command.",

  preview: function(pb, {object: {text}}) {
     if (noun_type_googlevoiceconfig.hasKey) {
           pb.innerHTML = (text
                    ? (<>Calling: 
                      {formatNumber(cleanNumber(text))}<br /><br />
                      From: {formatNumber(noun_type_googlevoiceconfig.getPhone())}</>)
                    : this.description);
     }
     else {
           pb.innerHTML = "Must be configured with the 'google voice setkey' command."
     }
  },

  execute: function({object: {text}}) {
    if (text) {
          //need to do error checking on number
          //text.replace(/[^0-9]/g,"");
          //if text.length < 11, prepend "+1"
          jQuery.post("https://www.google.com/voice/m/sendcall", { _rnr_se: noun_type_googlevoiceconfig.getKey(), number: '+1'+cleanNumber(text), phone: '+1'+noun_type_googlevoiceconfig.getPhone()} );
    } else {
      displayMessage(_("No number entered."));
    }
  }

});

CmdUtils.CreateCommand({
  // todo: have command look up key from source <input name="_rnr_se"  value="THISHERE"/>
  names: ["google voice setkey"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "number to call"}],
  description: "Sets the required key for placing Google Voice calls.",

  preview: function(pb, {object: {text}}) {
    pb.innerHTML = (text
                    ? (<>Set your Google Voice key to:<br /><br />
                       {text}</>)
                    : this.description);
  },

  execute: function({object: {text}}) {
    if (text) {
          // store our api key on first run
          noun_type_googlevoiceconfig.setKey(text);

          displayMessage( "Key set to " + text  );
    } else {
      displayMessage(_("No key entered."));
    }
  }
});

CmdUtils.CreateCommand({
  names: ["google voice setphone"],
  arguments: [{role: "object",
               nountype: noun_arb_text,
               label: "Your phone number ###-###-####."}],
  description: "Google Voice will call you at this number.",

  preview: function(pb, {object: {text}}) {
    pb.innerHTML = (text
                    ? (<>Your phone number:<br /><br />
                       {text}</>)
                    : this.description);
  },

  execute: function({object: {text}}) {
    if (text) {
          noun_type_googlevoiceconfig.setPhone(text.replace(/[^0-9]/g,""));

          displayMessage( "Google Voice will call you at " + text );
    } else {
      displayMessage(_("No phone number entered."));
    }
  }
});