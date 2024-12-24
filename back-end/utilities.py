import requests
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from selenium.common.exceptions import WebDriverException
import platform
from flask import jsonify

ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg'}


def allowed_file(filename: str) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    
    Args:
        filename (str): Name of the uploaded file
        
    Returns:
        bool: True if file extension is allowed, False otherwise
    """
    return '.' in filename and filename.rsplit(
        '.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_chrome_options():
    """
    Configure Chrome options based on the operating system
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Add binary location based on OS
    system = platform.system().lower()
    if system == "linux":
        chrome_options.binary_location = "/usr/bin/google-chrome"  # Default Linux path
    elif system == "darwin":  # macOS
        chrome_options.binary_location = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    # Windows usually doesn't need binary location specified

    return chrome_options


def extract_text_from_url(url: str, need_js: bool = False) -> str:
    """
    Extract main content from a webpage URL.
    
    Args:
        url (str): The URL to parse
        need_js (bool): Whether JavaScript rendering is needed
        
    Returns:
        str: Extracted text content
    """
    try:
        if need_js:
            try:
                chrome_options = get_chrome_options()

                # Initialize the Chrome WebDriver
                driver = webdriver.Chrome(service=Service(
                    ChromeDriverManager().install()),
                                          options=chrome_options)

                driver.get(url)
                time.sleep(5)
                page_source = driver.page_source
                driver.quit()

            except WebDriverException as e:
                # Fallback to requests if Chrome is not available
                print(
                    f"Chrome automation failed: {str(e)}. Falling back to requests..."
                )
                return extract_text_from_url(url, need_js=False)

        else:
            # For static pages, use requests
            response = requests.get(
                url,
                headers={
                    'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
            response.raise_for_status()
            page_source = response.text

        # Parse the HTML
        soup = BeautifulSoup(page_source, 'html.parser')

        # Remove unwanted elements
        for element in soup.find_all(
            ['script', 'style', 'nav', 'header', 'footer', 'iframe']):
            element.decompose()

        # Find the main content
        main_content = None

        # Try common content containers
        content_candidates = soup.find_all(
            ['article', 'main', 'div'],
            class_=lambda x: x and any(term in str(x).lower() for term in
                                       ['content', 'article', 'post', 'main']))

        if content_candidates:
            main_content = max(content_candidates,
                               key=lambda x: len(x.get_text()))
        else:
            main_content = soup.find('body')

        if main_content:
            # Get text and clean it up
            text = main_content.get_text(separator='\n', strip=True)
            # Remove excessive newlines
            text = '\n'.join(line.strip() for line in text.splitlines()
                             if line.strip())
            return text

        return "No content found"

    except Exception as e:
        raise Exception(f"Failed to parse URL: {str(e)}")


def create_response(data=None, error=None, status_code=200):
    """Helper function to create consistent API responses"""
    if error:
        return jsonify({'error': str(error)}), status_code
    return jsonify(data), status_code


extract_text_from_url("https://mp.weixin.qq.com/s/IXrxfaMQzFxswSxCsulejw",
                      True)
