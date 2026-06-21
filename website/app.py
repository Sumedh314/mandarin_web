from urllib.parse import parse_qs, urlparse
from datetime import datetime, timezone
from pathlib import Path
import random
import json
import time
import os

from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranslationLanguageNotAvailable

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from fsrs import Scheduler, Card, Rating, ReviewLog

from deep_translator import GoogleTranslator
from google import genai
from google.genai import types

import yt_dlp
import cv2
import numpy

import requests

from dotenv import load_dotenv

import jieba
import pinyin

from app import create_app


app = create_app()

@app.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
    # with yt_dlp.YoutubeDL({'format': 'bestvideo', 'quiet': True}) as ydl:
    #     info = ydl.extract_info('https://www.youtube.com/watch?v=NxITmnGIl7E', download=False)
    
    # url = info['url']
    # fps = info['fps']
    # duration = info['duration']
    
    # capture = cv2.VideoCapture(url)

    # while capture.isOpened():
    #     ret, frame = capture.read()