# Medical Report Analyzer

A Python script that extracts text from medical reports in multiple formats (PDF, JPEG, PNG, Word) and generates brief, easy-to-understand summaries using NVIDIA's LLM API.

## Features

- Extracts text from multiple file formats: PDF, JPEG, PNG, Word documents (.docx)
- OCR support for image-based PDFs and image files
- Intelligently chunks text for processing
- Generates brief summaries highlighting key findings (e.g., "Cholesterol is high, blood pressure is low")
- Simple command-line interface

## Installation

1. Create a virtual environment (recommended for macOS):
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

**Note:** For OCR functionality (scanned PDFs / images), you need **Tesseract** and **Poppler**:
- **macOS:**
  - `brew install tesseract`
  - `brew install poppler`
- **Linux:** `sudo apt-get install tesseract-ocr` (Ubuntu/Debian) or `sudo yum install tesseract` (RHEL/CentOS)
- **Windows:** Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

**Alternative:** If you prefer not to use a virtual environment, you can use:
```bash
pip3 install --user -r requirements.txt
```

3. Set up your NVIDIA API key:
```bash
export NVIDIA_API_KEY='your-api-key-here'
```

Get your API key from [NVIDIA Build](https://build.nvidia.com/)

Or you can pass it directly when running the script (see Usage below).

## Usage

**Note:** If you're using a virtual environment, make sure it's activated:
```bash
source venv/bin/activate
```

Basic usage with different file formats:
```bash
# PDF file
python3 medical_report_analyzer.py /path/to/medical_report.pdf

# Image file (JPEG/PNG)
python3 medical_report_analyzer.py /path/to/medical_report.jpg

# Word document
python3 medical_report_analyzer.py /path/to/medical_report.docx
```

With API key as argument:
```bash
python3 medical_report_analyzer.py /path/to/medical_report.pdf --api-key your-api-key
```

Using a different model:
```bash
python3 medical_report_analyzer.py /path/to/medical_report.pdf --model meta/llama-3.1-70b-instruct
```

Available NVIDIA models:
- `meta/llama-3.1-8b-instruct` (default, fast and cost-effective)
- `meta/llama-3.1-70b-instruct` (more powerful)
- `mistralai/mistral-7b-instruct-v0.2`
- `google/gemma-2-9b-it`

## Example Output

```
============================================================
Medical Report Analyzer
============================================================

PDF File: /path/to/report.pdf

Processing PDF with 3 page(s)...
Extracted 4523 characters from PDF

Split into 2 chunk(s) for processing

Sending to LLM for analysis...

============================================================
MEDICAL REPORT SUMMARY
============================================================

Cholesterol levels are elevated at 240 mg/dL (normal range: <200). 
Blood pressure is slightly low at 90/60 mmHg. Blood sugar levels 
are within normal range. Vitamin D levels are low and may require 
supplementation.

============================================================
```

## Supported File Formats

- **PDF** (.pdf) - Text extraction with OCR fallback for image-based PDFs
- **Images** (.jpg, .jpeg, .png, .bmp, .tiff) - OCR text extraction
- **Word Documents** (.docx) - Direct text extraction (old .doc format not supported)

## Requirements

- Python 3.7+
- NVIDIA API key (get from https://build.nvidia.com/)
- Tesseract OCR (for image and image-based PDF processing)
- Required Python packages (see requirements.txt):
  - pdfplumber (PDF text extraction)
  - pytesseract (OCR)
  - Pillow (image processing)
  - pdf2image (PDF to image conversion for OCR)
  - python-docx (Word document processing)
  - requests (API calls)

## Notes

- The script automatically detects file type and uses appropriate extraction method
- For text-based PDFs, uses pdfplumber for better extraction including tables
- For image-based PDFs and image files, uses OCR (Tesseract) to extract text
- Word documents are processed directly without OCR
- Large files are automatically truncated to fit within token limits
- Default model is `meta/llama-3.1-8b-instruct` for good balance of speed and quality
- You can use larger models like `meta/llama-3.1-70b-instruct` for potentially better results
- The script uses NVIDIA's NIM (NVIDIA Inference Microservices) API endpoint by default
