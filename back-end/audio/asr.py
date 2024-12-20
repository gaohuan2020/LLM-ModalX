from funasr import AutoModel
import os
import yaml
from funasr.utils.postprocess_utils import rich_transcription_postprocess


class ASRService:
    """Service for performing Automatic Speech Recognition using FunASR."""

    def __init__(self, config_name: str = "asr_config.yaml") -> None:
        config_path = os.path.join(os.path.dirname(__file__), 'config',
                                   config_name)
        if not os.path.exists(config_path):
            raise FileNotFoundError(
                f"Configuration file not found: {config_path}")

        with open(config_path, 'r') as f:
            self.config = yaml.safe_load(f)

        try:
            self.model = self._initialize_model()
        except Exception as e:
            print(f"Error initializing ASR model: {e}")
            self.model = None

    def _initialize_model(self) -> AutoModel:
        """Initialize the ASR model with configuration parameters."""
        return AutoModel(
            model=self.config['model']['name'],
            model_revision=self.config['model']['revision'],
            vad_model=self.config['vad']['model'],
            vad_model_revision=self.config['vad']['revision'],
            punc_model=self.config['punctuation']['model'],
            punc_model_revision=self.config['punctuation']['revision'],
            spk_model=self.config['speaker']['model'],
            spk_model_revision=self.config['speaker']['revision'],
        )

    def transcribe(self, audio_file_path: str) -> str:
        """
        Transcribe audio file to text.

        Args:
            audio_file_path: Path to the audio file to transcribe

        Returns:
            Transcribed text with rich formatting

        Raises:
            FileNotFoundError: If audio file doesn't exist
            Exception: If ASR model is not initialized
        """
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"File not found: {audio_file_path}")
        if self.model is None:
            raise Exception("ASR model not initialized")

        result = self.model.generate(
            input=audio_file_path,
            cache={},
            language=self.config['transcription']['language'],
            use_itn=self.config['transcription']['use_itn'],
            batch_size_s=self.config['transcription']['batch_size_s'],
            merge_vad=True,
            merge_length_s=self.config['transcription']['merge_length_s'],
        )
        return rich_transcription_postprocess(result[0]["text"])
