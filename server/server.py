from fastapi import FastAPI, Query
import easyocr
import numpy as np
from PIL import Image
import io
import pyautogui
import time

app = FastAPI()
reader = easyocr.Reader(['en'], gpu=False)

@app.get('/find-text')
def find_text(left: int, top: int, width: int, height: int, debug: bool = Query(False)):
  try:
    screenshot = pyautogui.screenshot(region=(left, top, width, height))

    if debug:
      screenshot.save('screenshot.png')

    results = reader.readtext(np.array(screenshot))
    texts = []

    for (bbox, text, _) in results:
      (left, top), (right, bottom) = bbox[0], bbox[1]

      width = right - left
      height = bottom - top

      texts.append({
        'content': text,
        'left': int(left),
        'top': int(top),
        'width': int(width),
        'height': int(height),
      });

    return { 'texts': texts }
  except Exception:
    return { 'texts': [] }

@app.get('/press')
def press(key: str):
  pyautogui.press(key)

@app.get('/click')
def click(left: int, top: int, interval: float = Query(0.01), button: str = Query('left'), debug: bool = Query(False)):
  if debug:
    pyautogui.moveTo(left, top)
  else:
    pyautogui.click(left, top, interval=interval, button=button)

@app.get('/drag')
def drag(startLeft: int, startTop: int, endLeft: int, endTop: int, duration: float = Query(0.2), debug: bool = Query(False)):
  pyautogui.moveTo(startLeft, startTop)

  if not debug:
    pyautogui.mouseDown()

  pyautogui.moveTo(endLeft, endTop, duration=duration)

  if not debug:
    time.sleep(0.5)
    pyautogui.mouseUp()
