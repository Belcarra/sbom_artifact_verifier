# SPDX SBOM Overview (Belcarra Demo Kits)

## Rationale for SPDX SBOM
SPDX provides a standardized, machine-readable format for describing software components and their relationships. It is widely recognized, supports tooling interoperability, and aligns with CISA’s SBOM Minimum Elements guidance for capturing component identity, provenance, and dependency relationships.

## What Is Being Generated
Two SPDX 2.2 JSON SBOMs are generated:
- An **OEM (top-level) kit SBOM** for the `belcarrademo` package, which includes a nested ZIP containing the end-user kit and additional OEM artifacts.
- An **End-user kit SBOM** for the `BelcarraDemoUSBLAN` package, which describes the drivers and supporting files delivered to end users.

Each SBOM includes `creationInfo`, a root package, `filesAnalyzed`, `hasFiles`, and relationships to support dependency graphing and integrity verification.

## How This Applies to the Two Packages
### OEM kit (`belcarra/oem/_manifest/spdx_2.2/manifest.spdx.json`)
- **Root package**: `belcarrademo` version `02-05-01-001`.
- **Files**: includes the nested end-user ZIP plus OEM configuration and documentation files.
- **Relationships**:
  - `SPDXRef-DOCUMENT DESCRIBES SPDXRef-RootPackage` ties the document to the package.
  - `SPDXRef-RootPackage CONTAINS SPDXRef-File--...drivers.zip` expresses that the OEM package includes the nested end-user ZIP.
  - `SPDXRef-RootPackage CONTAINS DocumentRef-External:SPDXRef-RootPackage` links to the external SPDX document for the end-user kit, enabling cross-document dependency tracking.

### End-user kit (`belcarra/kit/_manifest/spdx_2.2/manifest.spdx.json`)
- **Root package**: `BelcarraDemoUSBLAN` version `02-05-01-001`.
- **Files**: includes driver binaries, INF/CAT files, and installer/support files.
- **Relationships**:
  - `SPDXRef-DOCUMENT DESCRIBES SPDXRef-RootPackage` ties the document to the package.
  - The file list is represented via `hasFiles` with `filesAnalyzed=true`, which is valid SPDX for associating files to the package without individual `CONTAINS` relationships.

## Rationale for the Dependency Relationship Display
The UI displays two dependency rows when a nested kit is opened from the parent:
- **Dependency Relationship (from Parent)** is contextual and derived from the parent kit:  
  `belcarrademo 02-05-01-001` **CONTAINS** `BelcarraDemoUSBLAN 02-05-01-001`  
  This aligns with SPDX semantics (`CONTAINS` is appropriate for package-to-package containment) and with CISA’s framing of dependency relationships as inclusion.
- **Dependency Relationship** (within the nested SBOM) shows the nested SBOM’s own relationship, derived from its manifest (document **DESCRIBES** the package). This ensures the SBOM remains valid and meaningful when opened standalone.

This approach preserves the formal SPDX meaning of `DESCRIBES` (document-to-element) while also exposing the practical containment relationship needed for a dependency graph across the nested ZIP structure.
