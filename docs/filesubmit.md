## Filesubmit
### Delete Saved document
```JS
var ajax = {
   url: '/services/Studyroutemobile.asmx/DeleteWorkingDocument',
   type: 'GET',
   data: {
      cpId: 25478948,
      assignmentId: 55093
   }
};
```
#### Response
```JSON
{"DELETE_WORKING_DOCUMENT": "TRUE"}
```

### Save document
```JS
var ajax = {
   url: '/Services/Assignment.asmx/UploadTempFile',
   type: 'POST',
   data: {
      OriginalFileName: 'Casper Bloemendaal - S1133305.docx'
      FullFileName: 'Casper Bloemendaal - S1133305.docx'
      AssignmentId: 55093
      ProfileGUID:
      Cp_Name:
      files[]: (binary)
   }
};
```
#### Response
```XML
<xml>
   <errNr>0</errNr>
   <errDescription />
   <customData>
      <UploadedDoc>
         <SUCCESS>1</SUCCESS>
         <CONVERTED_COUNT>0</CONVERTED_COUNT>
         <TEMP_UPLOAD>1</TEMP_UPLOAD>
         <CPVID>26583819</CPVID>
         <ASSIGNMENTTEMPPACKAGE_ID>148516</ASSIGNMENTTEMPPACKAGE_ID>
         <WORK_FOLDERID>3732628</WORK_FOLDERID>
      </UploadedDoc>
   </customData>
</xml>
```

### Submit Saved document
```JS
var ajax = {
   url: '/services/Studyroutemobile.asmx/SubmitExistingDocument',
   type: 'GET',
   data: {
      assignmentId: 54846,
      cpId: 25482319,
      cpType: 0,
      dc: 1546432563119
   }
};
```
#### Response
```JSON
{"SUCCESS":"TRUE","ERROR":"0"}
```

### Submit document
```JS
var ajax = {
   url: '/Services/Assignment.asmx/UploadFile',
   type: 'POST',
   data: {
      OriginalFileName: 'Casper Bloemendaal - S1133305.docx'
      FullFileName: 'Casper Bloemendaal - S1133305.docx'
      AssignmentId: 55093
      ProfileGUID:
      Cp_Name:
      files[]: (binary)
   }
};
```
#### Response
```XML
<xml>
   <errNr>0</errNr>
   <errDescription />
   <customData>
      <UploadedDoc>
         <SUCCESS>1</SUCCESS>
         <CONVERTED_COUNT>0</CONVERTED_COUNT>
         <CPVID>26584069</CPVID>
         <PLAGIARISMECHECK>false</PLAGIARISMECHECK>
         <ASSIGNMENT_SUBMITTED_PACKAGE_ID>1131521</ASSIGNMENT_SUBMITTED_PACKAGE_ID>
      </UploadedDoc>
   </customData>
</xml>
```


## LoadUserHandinDetails
### Submit
#### Submit
```JSON
[
  {
    "ID": 54174,
    "TITLE": "Inleveren samenvatting pakketselectietraject",
    "STUDYROUTE_NAME": "Pakketselectie",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.PS.V18/Pakketselectie/Pakketselectie/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4366351.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_STATUS": -1,
    "INITIAL_DOCUMENT_CPID": -1,
    "IS_INITIAL": 1,
    "HANDIN_DATE": "/Date(1545313567477)/",
    "HANDIN_URL": "/CMS/DPF/103288/Windesheimportfolio/Courses/Pakketselectie/Inleveropdracht/Pakketselectie voorbereiding - Casper Bloemendaal - S1133305.pdf",
    "HANDIN_NAME": "Pakketselectie voorbereiding - Casper Bloemendaal - S1133305.pdf",
    "HANDIN_TYPE": 0,
    "REVIEW_TYPE": -1,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": -3,
    "ASSIGNMENT_SUBMITTED_PACKAGE_ID": 1128174,
    "XCAS_CONTENTPACKAGEVERSION_ID": 26514046,
    "XCAS_CONTENTPACKAGEVERSION_NAME": "0.0.0.1"
  }
]
```

#### Submit, StartDocument
```JSON
[
  {
    "ID": 53604,
    "TITLE": "8-11-2018 Tentamen Webprogrammeren",
    "STUDYROUTE_NAME": "Webprogrammeren",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.WP.V18/Webprogrammeren/Algemeen studieroute template/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4323667.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.WP.V18/Webprogrammeren/89071_Antwoordbestanden.rar",
    "INITIAL_DOCUMENT_NAME": "89071_Antwoordbestanden.rar",
    "INITIAL_DOCUMENT_TYPE": 0,
    "INITIAL_DOCUMENT_STATUS": -1,
    "INITIAL_DOCUMENT_CPID": -1,
    "IS_INITIAL": 1,
    "HANDIN_DATE": "/Date(1541668682943)/",
    "HANDIN_URL": "/CMS/DPF/103288/Windesheimportfolio/Courses/Webprogrammeren/Inleveropdracht/S1133305-Casper Bloemendaal-ICTM1S.zip",
    "HANDIN_NAME": "S1133305-Casper Bloemendaal-ICTM1S.zip",
    "HANDIN_TYPE": 0,
    "REVIEW_TYPE": -1,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": -3,
    "ASSIGNMENT_SUBMITTED_PACKAGE_ID": 1086932,
    "XCAS_CONTENTPACKAGEVERSION_ID": 25758562,
    "XCAS_CONTENTPACKAGEVERSION_NAME": "0.0.0.1"
  }
]
```

#### Submit, Reviewed
```JSON
[
  {
    "ID": 55162,
    "TITLE": "Inleveren portfolio KBS (deadline 10 december 12:00 uur 's middags, één ingepakt bestand per groep)",
    "STUDYROUTE_NAME": "Kenmerkende beroepssituatie 1- ontwerp en realisatie",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.KBSa.V18/Kenmerkende beroepssituatie 1- ontwerp en realisatie/Algemeen studieroute template/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4427289.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_STATUS": -1,
    "INITIAL_DOCUMENT_CPID": -1,
    "IS_INITIAL": 1,
    "HANDIN_DATE": "/Date(1544437854843)/",
    "HANDIN_URL": "/CMS/DPF/103288/Windesheimportfolio/Courses/Kenmerkende beroepssituatie 1- ontwerp en realisatie/Inleveropdracht/KBS ICTM1S Groep1.zip",
    "HANDIN_NAME": "KBS ICTM1S Groep1.zip",
    "HANDIN_TYPE": 0,
    "REVIEW_DATE": "/Date(1545397449613)/",
    "REVIEW_STATUS": 3,
    "REVIEW_URL": "/CMS/DPF/103288/Windesheimportfolio/Courses/Kenmerkende beroepssituatie 1- ontwerp en realisatie/Inleveropdracht/rev_KBS ICTM1S Groep1.zip/Beoordelingsformulier klasS gr 1.docx",
    "REVIEW_NAME": "Beoordelingsformulier klasS gr 1.docx",
    "REVIEW_TYPE": 0,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": -3,
    "ASSIGNMENT_SUBMITTED_PACKAGE_FEEDBACK_ID": 561898,
    "ASSIGNMENT_SUBMITTED_PACKAGE_ID": 1117073,
    "XCAS_CONTENTPACKAGEVERSION_ID": 26316017,
    "XCAS_CONTENTPACKAGEVERSION_NAME": "0.0.0.1"
  }
]
```

### Saved
#### Saved
```JSON
[
  {
    "ID": 55261,
    "TITLE": "inleveren best practice(s)",
    "STUDYROUTE_NAME": "Pakketselectie",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.PS.V18/Pakketselectie/Pakketselectie/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4437812.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_URL": "/CMS/DPF/103288/Windesheimportfolio/Courses/Pakketselectie/Inleveropdracht/~04d742f0-0e74-4e1e-bf8b-5b0aed850162/Dit is een test.txt",
    "INITIAL_DOCUMENT_NAME": "Dit is een test.txt",
    "INITIAL_DOCUMENT_TYPE": 0,
    "INITIAL_DOCUMENT_STATUS": 1,
    "INITIAL_DOCUMENT_CPID": 25483108,
    "IS_INITIAL": 0,
    "REVIEW_TYPE": -1,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": -3
  }
]
```

#### Saved, StartDocument
```JSON
[
  {
    "ID": 53386,
    "TITLE": "Oefentoets",
    "STUDYROUTE_NAME": "Webprogrammeren",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.WP.V18/Webprogrammeren/Algemeen studieroute template/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4309151.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_URL": "/CMS/DPF/103288/Windesheimportfolio/Courses/Webprogrammeren/Inleveropdracht/~df9be5ae-aa2c-4049-8b39-3b8dc0bdb0b8/Dit is een test.txt",
    "INITIAL_DOCUMENT_NAME": "Dit is een test.txt",
    "INITIAL_DOCUMENT_TYPE": 0,
    "INITIAL_DOCUMENT_STATUS": 1,
    "INITIAL_DOCUMENT_CPID": 25483331,
    "IS_INITIAL": 0,
    "REVIEW_TYPE": -1,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": -3
  }
]
```

### Ready
#### Ready
```JSON
[
  {
    "ID": 54640,
    "TITLE": "Inleveren definitieve uitwerking individuele opdracht - Deadline 7 januari 2019 om 12:00 uur",
    "STUDYROUTE_NAME": "Pakketselectie",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.PS.V18/Pakketselectie/Pakketselectie/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4392969.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_STATUS": -1,
    "INITIAL_DOCUMENT_CPID": -1,
    "IS_INITIAL": 1,
    "REVIEW_TYPE": -1,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": 4
  }
]
```

#### Ready, StartDocument
```JSON
[
  {
    "ID": 53386,
    "TITLE": "Oefentoets",
    "STUDYROUTE_NAME": "Webprogrammeren",
    "DESCRIPTION_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.WP.V18/Webprogrammeren/Algemeen studieroute template/_ASSIGNMENT_DEFINITION_DESCRIPTIONS/4309151.htm",
    "ASSIGNMENT_DOCUMENT_TYPE": -1,
    "INITIAL_DOCUMENT_URL": "/CMS/_STUDYROUTE_FOLDERS/7/I/ICT_/ICT.P.WP.V18/Webprogrammeren/Oefentoets_1_Antwoordbestanden.rar",
    "INITIAL_DOCUMENT_NAME": "Oefentoets_1_Antwoordbestanden.rar",
    "INITIAL_DOCUMENT_TYPE": 0,
    "INITIAL_DOCUMENT_STATUS": -1,
    "INITIAL_DOCUMENT_CPID": -1,
    "IS_INITIAL": 1,
    "REVIEW_TYPE": -1,
    "REVIEW_PUBLISHED": 1,
    "NATSCHOOL_STATUS": -3
  }
]
```
