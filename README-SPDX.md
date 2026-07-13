# SPDX SBOM Overview (Belcarra OEM and Driver Kits)

## Rationale for SPDX SBOM
SPDX provides a standardized, machine-readable format for describing software components and their relationships. It is widely recognized, supports tooling interoperability, and aligns with CISA’s SBOM Minimum Elements guidance for capturing component identity, provenance, and dependency relationships.

## What Is Being Generated
Two SPDX 2.2 JSON SBOMs are generated:
- An **OEM (top-level) kit SBOM** for the OEM release package, which includes a nested ZIP containing the end-user driver kit and additional OEM artifacts.
- An **End-user driver kit SBOM** for the distributable driver package, which describes the drivers and supporting files delivered to end users.

Each SBOM includes `creationInfo`, a root package, `filesAnalyzed`, `hasFiles`, and relationships to support dependency graphing and integrity verification.

Production driver kits may also include CRA provenance relationships that link the delivered driver binaries back to Belcarra's private archived build releases. These relationships are described below.

## Verification Layers
The Belcarra packaging and verification flow uses four distinct verification layers:

1. Driver catalog, e.g. `belcarra.cat`
   In the end-user kit, the Microsoft-signed driver catalog provides the Windows driver-package signature path for the installable payload.
2. `manifest.spdx.json`
   The SBOM lists hashes for the kit contents. The verifier recomputes those hashes for the files described by the manifest, excluding the `_manifest` directory.
3. `manifest.spdx.json.sha256`
   `sbom-tool` generates the SHA-256 sidecar for `manifest.spdx.json`. This provides a direct integrity check of the JSON manifest.
4. `_manifest/manifest.cat`
   Belcarra signs the Windows catalog for the package and SBOM artifacts. In the updated packaging flow, the catalog covers
   all files in the kit (except for the `manifest.cat` file itself).
   Including both `manifest.spdx.json` and `manifest.spdx.json.sha256`.

In summary:
- Microsoft signs the driver package catalog for the installable driver payload.
- The SBOM JSON authenticates the release contents by file hash.
- `sbom-tool` provides the checksum for the SBOM JSON.
- Belcarra signs the SBOM artifacts.

## How This Applies to the Two Packages
### OEM kit (`belcarra/oem/_manifest/spdx_2.2/manifest.spdx.json`)
- **Root package**: the OEM release package.
- **Files**: includes the nested end-user ZIP plus OEM configuration and documentation files.
- **Relationships**:
  - `SPDXRef-DOCUMENT DESCRIBES SPDXRef-RootPackage` ties the document to the package.
  - `SPDXRef-RootPackage CONTAINS SPDXRef-File--...drivers.zip` expresses that the OEM package includes the nested end-user ZIP.
  - `SPDXRef-RootPackage CONTAINS DocumentRef-External:SPDXRef-RootPackage` links to the external SPDX document for the end-user kit, enabling cross-document dependency tracking.

### End-user kit (`belcarra/kit/_manifest/spdx_2.2/manifest.spdx.json`)
- **Root package**: the distributable Belcarra USBLAN driver kit.
- **Files**: includes driver binaries, INF/CAT files, and installer/support files.
- **Relationships**:
  - `SPDXRef-DOCUMENT DESCRIBES SPDXRef-RootPackage` ties the document to the package.
  - The file list is represented via `hasFiles` with `filesAnalyzed=true`, which is valid SPDX for associating files to the package without individual `CONTAINS` relationships.
  - Production kits can include `GENERATED_FROM` and `COPY_OF` relationships linking this public driver kit to a private archived build release.

## CRA Build Provenance Relationships
Belcarra keeps private driver build release archives for CRA audit support. These archives are not part of the public OEM package, but the public driver kit SBOM can refer to them by stable S3 object metadata and file hashes.

The current provenance model uses:

- `ExternalDocumentRef`: identifies the private build release SBOM using the SHA-256 of the archived build release SBOM.
- `GENERATED_FROM`: links the public driver kit root package to the private build release root package.
- `COPY_OF`: links each renamed public `.sys` or `.pdb` file to the corresponding archived build file.

Example relationship shape:

```json
{
  "spdxElementId": "SPDXRef-RootPackage",
  "relationshipType": "GENERATED_FROM",
  "relatedSpdxElement": "DocumentRef-BuildRelease:SPDXRef-RootPackage",
  "comment": "Driver kit files originate from archived private build release s3://belcarra-oem-releases/build/2.5.0-004.zip versionId=... zipSha256=... sbomSha256=..."
}
```

```json
{
  "spdxElementId": "SPDXRef-File--drivers-amd64-belcarrablan.sys-...",
  "relationshipType": "COPY_OF",
  "relatedSpdxElement": "DocumentRef-BuildRelease:SPDXRef-File--fre-amd64-btblan-sys-...",
  "comment": "Renamed copy of archived build file fre/amd64/btblan.sys sha256=..."
}
```

The driver file names can change between the private build release and the OEM-specific public kit. The `COPY_OF` relationship plus SHA-256 hash shows that the delivered file is a byte-for-byte copy of the archived private build artifact, even when renamed for the OEM kit.

The verifier displays these relationships in the **SBOM Minimum Elements** table:

- `GENERATED_FROM` shows the private archived build release S3 key, S3 VersionId, ZIP SHA-256, and archived SBOM SHA-256.
- `COPY_OF File Provenance` lists each delivered `.sys` and `.pdb` file with the archived source file and SHA-256 hash.

## Private Build Archives
Private build release archives are stored in S3 under the build namespace, for example:

```text
s3://belcarra-oem-releases/build/2.5.0-004.zip
s3://belcarra-oem-releases/build/2.5.0-004/drivers.json
s3://belcarra-oem-releases/build/2.5.0-004/drivers.tgz
```

The private build ZIP contains the archived driver payload plus SBOM and catalog metadata. The `drivers.json` file records source file paths, timestamps, sizes, and SHA-256 hashes from the archived build. The original `drivers.tgz` is retained as the historical source archive for audit trail purposes.

For CRA audit support, the key properties are:

- The archived build object key.
- The S3 VersionId.
- The archive SHA-256.
- The archived SBOM SHA-256.
- The per-file SHA-256 values for `.sys` and `.pdb` files.

When Object Lock is enabled for production CRA archives, the S3 VersionId and object retention settings provide the immutable reference point for later audit verification.

## OEM Release Archives and Access Control
OEM release packages are stored separately from private build archives. The S3 layout uses an OEM namespace such as:

```text
s3://belcarra-oem-releases/oem/<oem-name>/<release-file>.zip
s3://belcarra-oem-releases/oem/<oem-name>/<release-file>.pdf
```

The public OEM archive website at `https://oem.belcarra.com` authenticates users with AWS Cognito. Cognito maps the OEM login to the OEM release folder that user is allowed to browse. The browser receives temporary AWS credentials scoped to the authorized S3 prefix, then lists and downloads only the matching OEM release objects.

The verifier at `https://verifier.belcarra.com` does not receive AWS credentials or Cognito tokens. The OEM archive page owns S3 access. When a user selects **Verify**, the OEM page downloads the selected package and sends only the package bytes to the verifier window using `postMessage`.

This keeps the responsibilities separated:

- S3 stores the release and build archives.
- Cognito controls OEM access to customer-visible release packages.
- The OEM archive page lists, downloads, and forwards selected package bytes.
- The verifier validates package integrity locally in the browser.
- Private build archives remain private, but public SBOM relationships carry enough S3 key, VersionId, and hash metadata to demonstrate provenance during CRA audit.

## Rationale for the Dependency Relationship Display
The UI displays two dependency rows when a nested kit is opened from the parent:
- **Dependency Relationship (from Parent)** is contextual and derived from the parent kit:  
  `<OEM kit>` **CONTAINS** `<driver kit>`  
  This aligns with SPDX semantics (`CONTAINS` is appropriate for package-to-package containment) and with CISA’s framing of dependency relationships as inclusion.
- **Dependency Relationship** (within the nested SBOM) shows the nested SBOM’s own relationship, derived from its manifest (document **DESCRIBES** the package). This ensures the SBOM remains valid and meaningful when opened standalone.

This approach preserves the formal SPDX meaning of `DESCRIBES` (document-to-element) while also exposing the practical containment relationship needed for a dependency graph across the nested ZIP structure.
