//  "Set Arlo Mode Based On Wind Speed", version 1.0b (beta)
//
//  Copyright 2017 Brad Slutsky.  All rights reserved.
// 
//  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// 
//  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// 
//  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// 
//  3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
// 
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
//  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
//  TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

//  The Big Picture:  Arlo cameras, or at least the first generation of Arlo indoor/outdoor cameras, can trigger a motion detection event when it is windy, even though there is no live object generating
//  infrared radiation.  From what I have read about the situation, it appears the reason for this is that first generation Arlo motion detection is based on reflected infrared radiation, and if the wind is blowing
//  and the sun is reflecting off the objects that are moving in the wind, those conditions can trigger the Arlo's motion detection.  There are various solutions to this, such as aiming the camera at something that
//  doesn't blow in the wind, or turning down the sensitivity.  Sometimes you want a camera in an area where things can blow in the wind though, and you might prefer for the camera sensitivity to be higher (and
//  catch more things moving) at times when the wind is not causing false positives for the motion detector.  This script makes API calls to Weather Underground every 5 minutes to determine whether it is windy in
//  your area.  If it is windy, the script turns down the sensitivity of your affected cameras.  When the wind dies down, the script restores the cameras to their usual, more sensitive, state.  The script also logs
//  the wind speed, date / time, and Arlo mode each time the wind speed crosses a pre-set threshold. You can view this historical information in a Google spreadsheet.  This script WILL NOT eliminate all instances
//  of motion-detection-due-to-wind.  It will only reduce the frequency of the motion detections caused by wind.  The effectiveness of the script can be adjusted by altering the wind speed threshold (which then
//  triggers the change in Arlo sensitivity), and by adjusting the camera-motion-detection-sensitivity settings based on the conditions where your cameras are located.  More on that below.  Below are the
//  instructions to get the script running.  NOTE:  If you are logged in to your Arlo account via app or web at the time this script logs in to change the mode, you will be logged out of the app or web.  Also, if you
//  happen to log in via app or web during the approximately two seconds that the script is logged in and changing the mode, you may end up bumping the script's login and causing the mode change to fail on that attempt.

//  INSTRUCTIONS
//  1. Go to https://docs.google.com/spreadsheets and "Start a new spreadsheet".  You need to have a Google account and be signed in to the account when you do this.
//  2. In the new spreadsheet, select the "Tools" menu and then choose "Script editor ..."
//  3. Copy and paste this code into the script editor.
//  4. Go to https://www.wunderground.com/signup?mode=api_signup and sign up for a Weather Underground account if you don't already have one.
//  5. Go to https://www.wunderground.com/weather/api/, click on "Key Settings", copy your API key, and paste it below BETWEEN the quotation marks after the wunderground_API_Key variable (keep the quotation marks in the line).
//  6. Go to http://www.latlong.net/convert-address-to-lat-long.html and put in the address where your Arlo cameras are located and click "Find".  Copy and paste your latitude below BETWEEN the quotation marks
//     after the LAT variable (keep the quotation marks in the line).  Copy and paste your longitude below BETWEEN the quotation marks after the LONG variable below (keep the quotation marks in the line).
//  7. Optional:  Read the comments above the WindThreshold variable below and decide whether you want to start with that number at 6 or try to adjust it.
//  8. Read the comments above the netgearWindyMode variable below.  If you have more than one "custom mode" for your Arlo cameras and if the one you want to invoke when it is windy is not the first "custom mode"
//     that you created, you will need to change the string for netgearWindyMode per the comments below.
//  9. Put your Arlo login e-mail below BETWEEN the quotation marks after the netgearLoginEmail variable (keep the quotation marks in the line).
//  10. Put your Arlo login password below BETWEEN the quotation marks after the netgearLoginPassword variable (keep the quotation marks in the line).
//  11. Save your script (to save, click the picture of the disc near the top of the Script Editor).
//  12. Go to the spreadsheet and give it a name (click on "Untitled spreadsheet" at the top left of the spreadsheet window and type a name for the spreadsheet).
//  13. Go back to the Script Editor and, at the top, click "Select function" and choose "SetUp".
//  14. To the left of where you just selected "SetUp", there will be a black triangle pointing to the right.  Click the triangle.  A window will pop us asking you
//      to grant the script permission to access your spreadsheet.  You need to grant those permissions.  A second window will pop up telling you that the script
//      isn't verified.  You need to click "Advanced" in that window and scroll down to the link that lets you go to your spreadsheet.  Once you click the link,
//      and save the permissions, the script should set up your spreadsheet, log in to Weather Underground, get the weather for the first time, and adjust your Arlo's
//      mode if necessary.
//  15. IMPORTANT:  If all went well in step 14, click the clock icon to the left of the triangle icon that you just clicked in step 14.  A dialog box will pop
//      up telling you that no triggers are set up.  You should set the script to run every 5 minutes.  This trigger mechanism will do so.  In the dialog box,
//      click where it says "No triggers set up.  Click here to add one now."
//  16. A new dialog box will appear with 4 pull-down menus.  In the first pull-down menu, select "CheckWindSpeed" -- this is the function that we want to trigger
//      every 5 minutes.  In the second pull-down menu you want it to say "Time-driven".  In the third pull-down menu, select "Minutes timer".  In the fourth
//      pull-down menu, select "Every 5 minutes".  See the comment below (before the CheckWindSpeed function) for why we are selecting "Every 5 minutes".
//      PLEASE DO NOT select "Every minute" unless you have read the comments below and have the paid membership to Weather Underground that would be required
//      for that setting.  Now click "Save" to save your new trigger.
//  17. Save your script again, then close the script editor and close the spreadsheet.
//  18. Enjoy!  You are done now.  If all goes well your wind speed will be monitored in the background and your Arlo modes will be adjusted automatically.  You don't need to log into the spreadsheet anymore for the
//      spreadsheet to work, but if you want to see how things have been working or if you want to look at historical wind speeds in your area, you can log in at any time.


//  The script's global variables are listed below.
//  You need to change the values of at least the following global variables:  wunderground_API_Key, LAT, LONG, netgearLoginEmail, and netgearLoginPassword

//  Sign up for Weather Underground at https://www.wunderground.com/signup?mode=api_signup then go to "Key Settings" at wunderground.com and copy your API key and paste it below
wunderground_API_Key = "Insert_Your_Weather_Underground_API_Key_Here";

//  Go to http://www.latlong.net/convert-address-to-lat-long.html and put in your address and click "Find", then put in your latitude and longitude below
LAT = "Insert_Your_Latitude_Here";
LONG = "Insert_Your_Longitude_Here";

//  "WindThreshold" is the wind speed -- in miles per hour -- at which the script will switch your Alro to "windy mode" / lower sensitivity.  You need to determine
//  empirically what wind speed sets off your Arlo's motion detection.  One way to do this is to go to Weather Underground when you get motion alerts from wind and
//  look at the current wind speed in your area.  This will give you a sense of the minimum wind speed that sets off your Arlo.  You also could just start with the
//  number 6 below and see whether you are happy with the results and try adjusting it up or down as necessary.
WindThreshold = 6;

//  You need to set up a "custom mode" in your Arlo app or on the Arlo website that lowers the sensitivity of the cameras that are seeing motion when it is windy, then
//  you need to figure out what the "string" is for that mode.  The "string" for Disarmed mode is "mode0".  The "string" for "Armed" mode is "mode1".  If you only have
//  one custom mode, and that is your mode for windy situations, then your "string" for "windy mode" is probably "mode2".  If you have two custom modes, and the custom
//  mode that you added second is the one with lower sensitivity for wind, then the "string" you want is probably "mode3".  You  may need to use trial and error to find
//  the right "string" (e.g., use "mode2", "mode3", etc. for "netgearWindyMode" and see in your app what mode the Arlo gets set to).
//  Possible future enhancements:
//  * List all available modes for the user and let the user choose the mode during setup
//  * Provide for switching into / out of "Schedule" mode (this requires a queueing system)
netgearWindyMode = "mode2";

//  Only change "netgearArmedMode" if you know what you are doing and don't want your camera set to "Armed" when the wind is calm
netgearArmedMode = "mode1";

//  Input your Arlo login e-mail below.  Sorry but it's necessary to include your login info -- otherwise the script can't log in as you and set your Arlo's mode.
//  You can look at the script and see that it is not doing anything funny with your login info.  Also remember to keep your spreadsheet private and don't send
//  it to anyone with your login info in it.
netgearLoginEmail = "Insert_The_E-Mail_Address_You_Use_To_Login_To_Arlo_Here";

//  Input your Arlo password below
netgearLoginPassword = "Insert_The_Password_You_Use_To_Login_To_Arlo_Here";

//  If you want to use a particular weather station, you can change "+LAT+","+LONG+" below to
//       pws:"+station_id+"
//  where "station_id" is the Weather Underground station_id of the station you want to use.
wundergroundURL = "http://api.wunderground.com/api/"+wunderground_API_Key+"/conditions/q/"+LAT+","+LONG+".json";

// *** Do not change these values ***
netgearLoginURL = "https://arlo.netgear.com/hmsweb/login";
netgearDevicesURL = 'https://arlo.netgear.com/hmsweb/users/devices';
netgearLogoutURL = "https://arlo.netgear.com/hmsweb/logout";
sheet = SpreadsheetApp.getActiveSheet();


//  Run this function one time on a blank spreadsheet to set up the spreadsheet
function SetUp() {
  var alertResult;
  var A1 = sheet.getRange("A1");
  var A2 = sheet.getRange("A2");
  var B1 = sheet.getRange("B1");
  var B2 = sheet.getRange("B2");
  var C1 = sheet.getRange("C1");
  var C2 = sheet.getRange("C2");
  var ui = SpreadsheetApp.getUi();
  sheet.setColumnWidth(1, 185);
  sheet.setColumnWidth(2, 277);
  sheet.setColumnWidth(3, 131);
  if (A1.getValue() != "Wunderground Wind Speed") {
    writeToCell(A1, "Wunderground Wind Speed", "center", "underline", "bold");
  }
  if (B1.getValue() != "Date / Time") {
    writeToCell(B1, "Date / Time", "center", "underline", "bold");
  }
  if (C1.getValue() != "Mode") {
    writeToCell(C1, "Mode", "center", "underline", "bold");
  }
  if ((A2.getValue() == "") || (isNaN(A2.getValue())) || (typeof A2.getValue() != 'number') || (typeof B2.getValue() != 'object') || ((C2.getValue() != "Armed Mode") && (C2.getValue() != "Windy Mode") && (C2.getValue() != "Mode Change Failed"))) {
    var params = {
      'muteHttpExceptions' : true
    };
    var response = UrlFetchApp.fetch(wundergroundURL, params);
    if (response.getResponseCode() == 200) {
      var weather = JSON.parse(response.getContentText());
      //  If you want to use wind gust speed instead of wind speed, change the line below to:  var CurrentWindSpeed = weather.current_observation.wind_gust_mph;
      var CurrentWindSpeed = weather.current_observation.wind_mph;
      //  Make sure what we got back looks like a number
      if (!isNaN(CurrentWindSpeed)) {
        writeToCell(A2, CurrentWindSpeed, "center", "none", "normal");
        writeToCell(B2, new Date(), "left", "none", "normal", "MMMM d, yyyy, hh:mm:ss am/pm");
        if (CurrentWindSpeed < WindThreshold) {
          SetArloMode(netgearArmedMode);
        } else {
          SetArloMode(netgearWindyMode);
        }
      } else {
        alertResult = ui.alert('Setup Problem', 'Error retrieving weather data.  Please try again.');
      }
    } else {
        alertResult = ui.alert('Setup Problem', 'Error retrieving weather data.  Please check your Wunderground API key and your latitude and longitude.');
    }
  }
}

//  Utility function to write to cells with formatting.  "cell" and "value" are required.  The other parameters are optional and if present they will be used to format the cell.
function writeToCell (cell, value, alignment, underlining, weight, numberFormat) {
  cell.setValue(value);
  if ((alignment == "left") || (alignment == "right") || (alignment == "center")) {
    cell.setHorizontalAlignment(alignment);
  }
  if ((underlining == "underline") || (underlining == "line-through") || (underlining == "none")) {
    cell.setFontLine(underlining);
  }
  if ((weight == "normal") || (weight == "bold")) {
    cell.setFontWeight(weight);
  }
  if (numberFormat != null) {
    cell.setNumberFormat(numberFormat);
  }
}

//  CheckWindSpeed is the main function.  It checks the wind speed and then (1) if the wind speed is equal to or greater than the threshold you set (and the last wind speed
//  was below the threshold) the function enters the wind speed and the date and time into the spreadsheet and then it sets your Arlo's mode to "netgearWindyMode", and
//  (2) if the wind speed is less than the threshold you set (and the last wind speed was equal to or greater than the threshold) the function enters the wind speed and the
//  date and time into the spreadsheet and then it sets your Arlo's mode to "netgearArmedMode".
//
//  *** REMEMBER TO SET THIS FUNCTION TO TRIGGER EVERY 5 MINUTES BY CLICKING THE CLOCK ICON IN THE GOOGLE SCRIPT EDITOR ***
//  You can set the function to trigger less frequently than every 5 minutes.  If you want it to trigger more frequently than every 5 minutes, you should know that the free
//  version of Weather Underground does not allow more than 500 API calls per day, so triggering the function more than about every 3 minutes requires you to have a paid
//  Weather Underground membership.  If you try to set the frequency to "Every minute" and don't have a paid Weather Underground account, I assume the calls to Weather Underground
//  below will fail starting at 8:20am every morning (when you have used your 500 free API calls) and probably this function will fail gracefully and no more successful weather
//  checks will occur until the next day.
function CheckWindSpeed() {
   var params = {
     'muteHttpExceptions' : true
   };
  var response = UrlFetchApp.fetch(wundergroundURL, params);
  //  Response should be 200 if the URL fetch was successful -- see https://developers.google.com/apps-script/reference/url-fetch/http-response#getResponseCode()
  if (response.getResponseCode() == 200) {
    var weather = JSON.parse(response.getContentText());
    //  If you want to use wind gust speed instead of wind speed, change the line below to:  var CurrentWindSpeed = weather.current_observation.wind_gust_mph;
    var CurrentWindSpeed = weather.current_observation.wind_mph;
    //  Make sure what we got back looks like a number
    if (!isNaN(CurrentWindSpeed)) {
      var LastWindSpeed = sheet.getRange("A2").getValue();
      //  If the last wind speed was greater than or equal to the threshold, and the current wind speed is less than the threshold, log the event and change the Arlo mode to "netgearArmedMode".
      //  If the last wind speed was below the threshold, and the current wind speed is greater than or equal to the threshold, log the event and change the Arlo mode to "netgearWindyMode".
      //  Do nothing if (1) the last wind speed was below the threshold and the current wind speed also is below the threshold, or (2) the last wind speed was greater than or equal to the threshold
      //  and the current wind speed also is greater than or equal to the threshold.
      if (((LastWindSpeed >= WindThreshold) && (Number(CurrentWindSpeed) < WindThreshold)) || ((LastWindSpeed < WindThreshold) && (Number(CurrentWindSpeed) >= WindThreshold))) {
        //  Push prior entries down and insert the newest entry at the top
        sheet.insertRowBefore(2);
        writeToCell(sheet.getRange("A2"), CurrentWindSpeed, "center", "none", "normal");
        writeToCell(sheet.getRange("B2"), new Date(), "left", "none", "normal", "MMMM d, yyyy, hh:mm:ss am/pm");
        //  Delete row 102, so we only keep 100 rows of data -- rows 2 - 101.  This prevents the spreadsheet from getting too large.  You can increase this number if you want to keep more historical
        //  data. At the time this comment was written, Google spreadsheets were limited to 2 million cells.  Since this spreadsheet uses 3 columns, IF YOU DELETE ALL COLUMNS BUT THE FIRST 3, you
        //  could theoretically have up to 666,666 rows at a time.  The devil probably will cause all kinds of problems with your spreadsheet if you do that, but if you want to try it, that is how
        //  the math works out.  Also, if you really want to push the number of rows to the limit, you probably should move the sheet.deleteRow command so that it appears above the sheet.insertRowBefore
        //  command (and change it to "sheet.deleteRow(101);") -- that way you will free up a row before you try to insert a new one.
        sheet.deleteRow(102);
        if (Number(CurrentWindSpeed) >= WindThreshold) {
          //  SetArloMode also writes the third column of data in the spreadsheet -- indicating what mode was set or logging a failure if the mode could not be set
          SetArloMode(netgearWindyMode);
//          You can send yourself an e-mail if you want to be notified of changes.  If the recipient is not your gmail address, the e-mail may end up in your spam folder.
//          If the subject line will be the same for each e-mail, you can move the "sendEmail" command outside this if-else statement.  Example of how to send an e-mail:
//          MailApp.sendEmail("your_e-mail@goes_here.com",
//                   "Subject line for high wind goes here",
//                   "Current wind speed at [your street] is " + CurrentWindSpeed + " mph");
        } else {
          SetArloMode(netgearArmedMode);
//          MailApp.sendEmail("your_e-mail@goes_here.com",
//                   "Subject line for low wind goes here",
//                   "Current wind speed at [your street] is " + CurrentWindSpeed + " mph");
        }
      }
    }
  }
}


//  This function sets your Arlo's mode.  The function assumes that you have exactly one Arlo basestation.  I don't think it is possible to have multiple basestations on a single
//  Netgear Arlo account.  If it is, the function probably will only operate on the "last" basestation.  If you do not have any basestations, the function should not make
//  any changes to your account, and the spreadsheet will record "Mode Change Failed".  Sorry for the poorly named variables in this function.  Once I got it working I decided
//  it wasn't broken so I shouldn't fix it.

//  For a future update:  Need to muteHttpExceptions for fetches and check for response code of 200

function SetArloMode (mode) {
  var formData = {
   'email': netgearLoginEmail,
   'password': netgearLoginPassword
  };
  var options = {
   'method' : 'post',
   'contentType': 'application/json',
   'payload' : JSON.stringify(formData)
  };
  var response = UrlFetchApp.fetch(netgearLoginURL, options);
  var responseArr = JSON.parse(response.getContentText());
  //  If we successfully logged in to Netgear, get the token and cookie we will need to identify the basestation and change its mode
  if (responseArr.success) {
    var strAuthToken = responseArr.data.token;
    var headers = response.getAllHeaders();
    var sessionCookie = headers["Set-Cookie"];
    var headers2 = {
      'Authorization' : strAuthToken,
      'Cookie' : sessionCookie.join("; ")
    }
    var options2 = {
        'method' : 'get',
        'contentType': 'application/json',
        'User-Agent' : 'web',
        'headers' : headers2
      };
    var deviceResponse = UrlFetchApp.fetch(netgearDevicesURL, options2);
    var deviceResponseArr = JSON.parse(deviceResponse.getContentText());
    //  If we successfully retrieved a list of your Arlo devices, find the basestation in the list and get the "deviceId", "xCloudId", and "userId" that we will need
    //  to use in changing the mode.
    if (deviceResponseArr.success) {
      var arloSystem = {};
      arloSystem.deviceId = "none";
      for (var i = 0; i < deviceResponseArr.data.length; i++){
        if (deviceResponseArr.data[i].deviceType == "basestation"){
          arloSystem.deviceId = deviceResponseArr.data[i].deviceId;
          arloSystem.xCloudId = deviceResponseArr.data[i].xCloudId;
          arloSystem.userId = deviceResponseArr.data[i].userId;
        }
      }
      //  If we found a basestation, change its mode to the mode that was passed to this function.  I do not believe it is possible to have two basestations on one
      //  account.  If it is possible though, the data we retrieved will only apply to the "last" basestation in the list we retrieved.
      if (arloSystem.deviceID != "none") {
        options2.method='post';
        options2.headers.xCloudId=arloSystem.xCloudId;
        var formData2 = {
          'to' : arloSystem.deviceId,
          'from' : arloSystem.userId + '_web',
          'action' : 'set',
          properties: {
          active: mode
          },
          'active' : mode,
          'publishResponse' : false,
          'resource' : 'modes',
          'responseURL' : '',
          'transId': ''
      };
      options2.payload=JSON.stringify(formData2);
      //  This URL is dependent on the "deviceId" of your basestation so I formed it here rather than listing it with the other URLs at the top.  I could have listed
      //  the base URL at the top and then modified it here to add the "deviceId", but that's not how I roll.
      netgearSetModeURL = 'https://arlo.netgear.com/hmsweb/users/devices/notify/'+arloSystem.deviceId;
      var deviceResponse2 = UrlFetchApp.fetch(netgearSetModeURL, options2);
      var deviceResponseArr2 = JSON.parse(deviceResponse2.getContentText());
      //  If the mode change was successful, write the new mode to the spreadsheet
      if (deviceResponseArr2.success) {
        if (mode == netgearWindyMode) {
          writeToCell(sheet.getRange("C2"), "Windy Mode", "left", "none", "normal");
        } else {
          writeToCell(sheet.getRange("C2"), "Armed Mode", "left", "none", "normal");
        }
      } else {
        writeToCell(sheet.getRange("C2"), "Mode Change Failed", "left", "none", "normal");
      }
    } else {
      writeToCell(sheet.getRange("C2"), "Mode Change Failed", "left", "none", "normal");
    }
  } else {
    writeToCell(sheet.getRange("C2"), "Mode Change Failed", "left", "none", "normal");
  }
    //  Log out from the Netgear system  
    options2.method = 'put';
    response = UrlFetchApp.fetch(netgearLogoutURL, options2);
} else {
  writeToCell(sheet.getRange("C2"), "Mode Change Failed", "left", "none", "normal");
}
}