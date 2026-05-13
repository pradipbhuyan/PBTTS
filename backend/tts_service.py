"""
Text-to-Speech service using Edge TTS
"""
import edge_tts
import asyncio
import os
import zipfile
from pathlib import Path

# Voice options (female voices)
VOICE_OPTIONS = {
    "en-IN-NeerjaNeural (Indian English - Default)": "en-IN-NeerjaNeural",
    "en-US-JennyNeural (US English)": "en-US-JennyNeural",
    "en-US-AriaNeural (US English)": "en-US-AriaNeural",
    "en-GB-SoniaNeural (UK English)": "en-GB-SoniaNeural",
    "en-GB-LibbyNeural (UK English)": "en-GB-LibbyNeural",
    "en-AU-NatashaNeural (Australian English)": "en-AU-NatashaNeural",
    "en-CA-ClaraNeural (Canadian English)": "en-CA-ClaraNeural",
    "hi-IN-SwaraNeural (Hindi - Female)": "hi-IN-SwaraNeural"
}

DEFAULT_VOICE = "en-IN-NeerjaNeural"
MAX_EMAIL_SIZE = 30 * 1024 * 1024  # 30MB

async def text_to_speech(text: str, output_file: str, voice: str = DEFAULT_VOICE):
    """
    Convert text to speech using Edge TTS
    
    Args:
        text: Text to convert
        output_file: Path to save MP3 file
        voice: Voice identifier
    
    Returns:
        Path to generated MP3 file
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)
    return output_file

def zip_file(file_path: str, output_dir: str = None) -> str:
    """
    Create a ZIP archive of a file
    
    Args:
        file_path: Path to file to zip
        output_dir: Directory to save zip file (default: same as file)
    
    Returns:
        Path to created ZIP file
    """
    file_path = Path(file_path)
    if output_dir is None:
        output_dir = file_path.parent
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    zip_filename = output_dir / f"{file_path.stem}.zip"
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(file_path, arcname=file_path.name)
    
    return str(zip_filename)

def should_zip(file_size: int) -> bool:
    """Check if file should be zipped based on size"""
    return file_size > MAX_EMAIL_SIZE

def get_available_voices() -> dict:
    """Get available voice options"""
    return VOICE_OPTIONS

def validate_text_content(content: str) -> bool:
    """Validate text content"""
    return bool(content and content.strip())

def estimate_file_size(text_length: int) -> int:
    """Estimate MP3 file size based on text length (rough estimate)"""
    # Rough estimate: ~10KB per 100 characters
    return (text_length // 10) * 1000
