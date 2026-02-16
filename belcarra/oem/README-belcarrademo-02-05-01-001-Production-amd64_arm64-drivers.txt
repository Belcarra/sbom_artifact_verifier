
Belcarra Technologies 2005
**************************
2026-02-13 00:30

This package contains the Belcarra USBLAN driver for Windows.

Depending on licensing this driver is compatible with:

    - Windows 10 - AMD64
    - Windows 11 - AMD64, ARM64

The driver package is configured to your requirements using the options from the
following configuration file, which is also included in this kit as a text
configuration file (.cfg) and a spreadsheet (.xlsx). If option changes are
required modify one of these and email to support@belcarra.com with a short
note explaining the change:

        - belcarrademo.cfg
        - belcarrademo.xlsx

The following zip file contains the re-distributable End-User Kit:

        belcarrademo-02-05-01-001.zip

These drivers are signed by Microsoft.

End-User Redistribution Kit Contents
************************************
Archive:  belcarrademo-02-05-01-001-Production-amd64_arm64-drivers.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  2026-02-13 00:30   drivers/
        0  2026-02-13 00:30   drivers/amd64/
  1134592  2026-02-12 23:24   drivers/amd64/btdblan.pdb
    93760  2026-02-12 23:36   drivers/amd64/btdblan.sys
        0  2026-02-13 00:30   drivers/arm64/
  1036288  2026-02-12 23:24   drivers/arm64/btdblan.pdb
    93792  2026-02-12 23:37   drivers/arm64/btdblan.sys
    14499  2026-02-12 23:36   drivers/belcarrademo.cat
     8573  2026-02-12 23:27   drivers/belcarrademo.inf
     4888  2026-02-13 00:30   License.txt
     2724  2026-02-13 00:30   README-INSTALL.txt
      144  2026-02-13 00:30   setup.bat
     2404  2026-02-13 00:30   verify-release.bat
        0  2026-02-13 00:30   _manifest/
        0  2026-02-13 00:30   _manifest/spdx_2.2/
     8466  2026-02-13 00:30   _manifest/spdx_2.2/manifest.spdx.json
    10982  2026-02-13 00:30   _manifest/spdx_2.2/manifest.spdx.json.cat
       64  2026-02-13 00:30   _manifest/spdx_2.2/manifest.spdx.json.sha256
---------                     -------
  2411176                     18 files


N.b. The End-User Redistribution Kit contains only the files required for end-user installation 
and the _manifest folder containing the SPDX SBOM.

The manifest files and the driver catalog file are included in the kit to allow for independent verification of the kit's
authenticity and integrity. 

The SBOM Catalog file is signed by Belcarra Technologies (2005) Corp with an EV Code Signing Certificate. 

The Driver cat Catalog file is signed by Microsoft.


Microsoft Signature Verification
********************************
Verifying: belcarrademo.cat
Signature Index: 0 (Primary Signature)
Hash of file (sha256): 2768F0D63CD17E2A32D26D1F3117A3AEBFE6A6699A76723CDC50C61B76728BA6
Signing Certificate Chain:
    Issued to: Microsoft Root Certificate Authority 2010
    Issued by: Microsoft Root Certificate Authority 2010
        Issued to: Microsoft Windows Third Party Component CA 2014
        Issued by: Microsoft Root Certificate Authority 2010
            Issued to: Microsoft Windows Hardware Compatibility Publisher
            Issued by: Microsoft Windows Third Party Component CA 2014
The signature is timestamped: Thu Feb 12 23:36:58 2026
Timestamp Verified by:
    Issued to: Microsoft Root Certificate Authority 2010
    Issued by: Microsoft Root Certificate Authority 2010
        Issued to: Microsoft Time-Stamp PCA 2010
        Issued by: Microsoft Root Certificate Authority 2010
            Issued to: Microsoft Time-Stamp Service
            Issued by: Microsoft Time-Stamp PCA 2010
Cross Certificate Chain:
    Issued to: Microsoft Root Certificate Authority 2010
    Issued by: Microsoft Root Certificate Authority 2010
        Issued to: Microsoft Windows Third Party Component CA 2014
        Issued by: Microsoft Root Certificate Authority 2010
            Issued to: Microsoft Windows Hardware Compatibility Publisher
            Issued by: Microsoft Windows Third Party Component CA 2014
Successfully verified: belcarrademo.cat
Number of files successfully Verified: 1
Number of warnings: 0
Number of errors: 0


OEM Kit Validation (SBOM)
*************************

This release includes a Software Bill of Materials (SBOM) to allow for 
independent verification of the kit's authenticity and integrity.

Manifest Contents:
- The "_manifest" folder contains an SPDX-standard inventory of all files.
- "manifest.spdx.json" lists the SHA-256 and SHA-1 hashes for every driver.
- "manifest.spdx.json.cat" is a Windows Security Catalog containing the 
  manifest hash, digitally signed by Belcarra Technologies (2005) Corp 
  using an EV Code Signing Certificate.

Verification Tool:
To verify this kit, you require the Microsoft SBOM Tool (x64). 
The x64 version will run on both amd64 and arm64 Windows systems. 
The tool must be installed in a directory included in your system PATH.

Download: https://github.com

How to Run Validation:
1. Ensure "sbom-tool-win-x64.exe" is in your system PATH or this directory.
2. Open a Command Prompt or PowerShell window in this folder.
3. Execute the provided script:
     
   > verify-release.bat

Expected Results:
- The tool will first verify the Belcarra EV Signature on the catalog.
- It will then re-hash all local driver files to ensure no tampering.
- Success is indicated by: "Validation Result . . . . . Success".
- A detailed report named "report.json" will be generated in the parent 
  directory of the drivers folder to avoid interference with the manifest.

User Release Validation
***********************

Unpack the belcarrademo-02-05-01-001.zip file and use the verify-release.bat script.



