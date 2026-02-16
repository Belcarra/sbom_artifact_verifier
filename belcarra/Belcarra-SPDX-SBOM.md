# Belcarra SPDX SBOM Overview

Belcarra licences a *Windows 11 NDIS/USB Filter Driver* to OEM's, allowing them to distribute the driver to their customers to use with their hardware. The driver kit is branded with the OEM's name, customized with the Vendor and Product IDs that their device(s) use. 

Both kits include an SPDX SBOM manifest, in JSON format, that describes the contents of the kit. 
The manifest is generated using the Microsoft sbom-tool, version 4.1.5, and conforms to the SPDX 2.2 specification. 
The manifest is signed with Belcarra's EV Code Signing Certificate signature, and includes a SHA256 hash of the manifest file for integrity verification.


## End-User Kit

The end-user kit, a zip file, contains the driver files, installation instructions, license. Two bat scripts are provided:

- setup.bat: uses the Microsoft pnputil utility to install the driver on the end-user's system. 
- verify-release.bat: uses the Microsoft sbom-tool-x64.exe to verify the SPDX SBOM _manifest included in the kit

```
belcarrademo-02-05-01-001-Production-amd64_arm64-drivers.zip
├───┬ _manifest/
│   └───┬ spdx_2.2/
│       ├── manifest.spdx.json
│       ├── manifest.spdx.json.cat
│       └── manifest.spdx.json.sha256
├───┬ drivers/
│   ├───┬ amd64/
│   │   ├── btdblan.pdb
│   │   └── btdblan.sys
│   ├───┬ arm64/
│   │   ├── btdblan.pdb
│   │   └── btdblan.sys
│   ├── belcarrademo.cat
│   └── belcarrademo.inf
├── License.txt
├── README-INSTALL.txt
├── setup.bat
└── verify-release.bat
```

- [_manifest/spdx_2.2/manifest.spdx.json](./kit/_manifest/spdx_2.2/manifest.spdx.json) is the SPDX SBOM for the End-User kit. 
- [ report-kit.json](./report-kit.json) is the sbom-tool verification report for the End-User kit.

|Field | Value |
| ---- | ----- |
|SBOM Author | Belcarra Technologies (2005) Corp.|
|Component Name | BelcarraDemoUSBLAN|
|Component Version | 02-05-01-001|
|Dependency Relationship | BelcarraDemoUSBLAN 02-05-01-001 DESCRIBES BelcarraDemoUSBLAN 02-05-01-001 |
|Tool Name | Microsoft.SBOMTool-4.1.5 |
|Timestamp | 2026-02-13T07:43:32Z |

### Dependency Relationship
The End-User kit manifest describes the relationship between the End-User kit and its components, indicating that the End-User kit describes the driver files (amd64 and arm64) as components.


## OEM Kit

The oem kit, a password protected zipfile, contains a README, the cfg files used to configure the release package, the End-User kit, zip file, and a single bat script:

- verify-release.bat: uses the Microsoft sbom-tool-x64.exe to verify the SPDX SBOM _manifest included in the End-User kit, zip file.

```
belcarrademo-02-05-01-001-Production-amd64_arm64.zip
├───┬ _manifest/
│   └───┬ spdx_2.2/
│       ├── manifest.spdx.json
│       ├── manifest.spdx.json.cat
│       └── manifest.spdx.json.sha256
├── belcarrademo-02-05-01-001-Production-amd64_arm64-drivers.zip
├── belcarrademo.cfg
├── belcarrademo.xlsx
├── License.txt
├── README-belcarrademo-02-05-01-001-Production-amd64_arm64-drivers.txt
└── verify-release.bat
```

- [_manifest/spdx_2.2/manifest.spdx.json](./oem-kit/_manifest/spdx_2.2/manifest.spdx.json) is the SPDX SBOM for the OEM kit.
- [report-oem-kit.json](./report-oem-kit.json) is the sbom-tool verification report for the OEM kit.

### Dependency Relationship
The OEM kit manifest describes the relationship between the OEM kit and the End-User kit, indicating that the OEM kit contains the End-User kit (zip file) as a component.

### SBOM Minimum Elements (CISA 2025 Draft)

|Field | Value |
| ---- | ----- |
|SBOM Author | Belcarra Technologies (2005) Corp. |
|Component Name | BelcarraDemoUSBLAN |
|Component Version | 02-05-01-001 |
|Dependency Relationship | belcarrademo 02-05-01-001 CONTAINS ./belcarrademo-02-05-01-001-Production-amd64_arm64-drivers.zip
|                        |belcarrademo-02-05-01-001-Production-amd64_arm64-drivers.zip |
|Tool Name | Microsoft.SBOMTool-4.1.5 |
|Timestamp | 2026-02-13T07:43:37Z |





