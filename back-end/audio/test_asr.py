import unittest
from asr import ASRService
import os


class TestASRService(unittest.TestCase):

    def setUp(self):
        """Set up test fixtures before each test method."""
        self.asr = ASRService()
        self.test_audio_file = "uploads/audio/20241220_072418_recording.wav"

    def tearDown(self):
        """Clean up after each test method."""
        self.asr = None

    def test_asr_transcription(self):
        """Test basic transcription functionality."""
        # Check if test file exists
        self.assertTrue(os.path.exists(self.test_audio_file),
                        f"Test audio file not found: {self.test_audio_file}")

        # Perform transcription
        result = self.asr.transcribe(self.test_audio_file)

        # Basic validation of the result
        self.assertIsInstance(result, str,
                              "Transcription result should be a string")
        self.assertGreater(len(result), 0,
                           "Transcription result should not be empty")

    def test_asr_file_not_found(self):
        """Test error handling for non-existent files."""
        with self.assertRaises(FileNotFoundError):
            self.asr.transcribe("non_existent_file.wav")

    def test_asr_initialization(self):
        """Test ASR service initialization."""
        # Test successful initialization
        self.assertIsNotNone(self.asr.model, "ASR model should be initialized")

        # Test with invalid config file
        with self.assertRaises(FileNotFoundError):
            ASRService("non_existent_config.yaml")


if __name__ == '__main__':
    unittest.main()
