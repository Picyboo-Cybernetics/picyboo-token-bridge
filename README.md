# PICYBOO Token Bridge

Proof-of-concept utility for encoding conversions between token representations.

**Status:** Archived • Demo only • No support  
**Trademark:** PICYBOO — US 97338199 / CA 2173851

## Features
- hex ↔ base58 ↔ base64 conversions
- file-mode to convert entire files

## Install
```bash
npm i
npm link   # optional to expose 'pbbridge' globally
```

## CLI
```bash
pbbridge encode --in hex --out base58 DEADBEEF
pbbridge file --in base64 --out hex ./examples/sample.txt
```

## Legal
© Picyboo Cybernetics. MIT License. PICYBOO is a trademark of Picyboo Cybernetics Inc.
