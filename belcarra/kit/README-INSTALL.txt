USBLAN Driver
#############

This driver kit contains the necessary files to install the USBLAN driver on Windows 10 and Windows 11.

The driver is signed by Microsoft.

A SPDX manifest is included to allow for independent verification of the kit's authenticity and integrity.
The manifest is digitally signed by Belcarra Technologies (2005) Corp using an EV Code Signing Certificate.

USBLAN Installation             
*******************

Please read License.txt for the end user license agreement.

For best results, run the setup.bat file BEFORE plugging your device in.

The setup.bat script uses pnputil.exe from Microsoft to pre-install the drivers
required for your device.

There are two methods to install:

    1. Start a Command shell with Administrator priviliges and run setup.bat.
    2. Using File Explorer Right Click on the setup.bat file and use "Run as administrator".

Driver Validation (SBOM)
########################

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


USBLAN Device Removal
*********************
Installed devices can be removed using the Device Manager program.  

When removing devices, there is an option in the Device Manager confirmation dialog box
to "remove driver software". This option will remove USBLAN and all device
instances from the registry.  

More Information

    - http://usblan.belcarra.com/p/updating-usblan.html
    - http://usblan.belcarra.com/p/uninstalling.html

