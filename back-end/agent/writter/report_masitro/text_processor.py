class TextProcessor:
    # 默认的过滤词列表
    DEFAULT_FILTER_WORDS = [
        '例如，',
        '例如:',
        '比如，',
        '比如:',
        '譬如，',
        '譬如:',
        '所以，',
        '因此，',
        '总的来说，',
        '总而言之，'
    ]

    def __init__(self, filter_words=None):
        """
        初始化文本处理器
        
        Args:
            filter_words: 可选的自定义过滤词列表，如果不提供则使用默认列表
        """
        self.filter_words = filter_words or self.DEFAULT_FILTER_WORDS

    def process_text(self, text: str) -> str:
        """
        处理文本，移除不需要的词语和字符
        
        Args:
            text: 需要处理的文本
            
        Returns:
            处理后的文本
        """
        processed_text = text
        
        # 移除过滤词
        for word in self.filter_words:
            processed_text = processed_text.replace(word, '')
            
        return processed_text 