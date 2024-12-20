from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
import yaml
from pathlib import Path

# 读取配置文件
config_path = Path(__file__).parent / "config.yaml"
if not config_path.exists():
    raise FileNotFoundError(f"Configuration file not found at: {config_path}")

with open(config_path, "r") as f:
    config = yaml.safe_load(f)

llm = ChatOpenAI(
    openai_api_base=config["llm"]["api_base"],
    model=config["llm"]["model"],
    openai_api_key=config["llm"]["api_key"],
    temperature=config["llm"]["temperature"],
)

embeddings = OpenAIEmbeddings(
    model=config["embeddings"]["model"],
    base_url=config["embeddings"]["base_url"],
    api_key=config["embeddings"]["api_key"],
)
