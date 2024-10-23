import express from 'express'
import puppeteer from 'puppeteer'

const app = express();
const port = process.env.PORT || 3000;

app.get('/scrape/:url', async (req, res) => {
  const url = req.params.url;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { timeout: 60000 });

    const result = await page.evaluate(() => {
      const url = Array.from(document.querySelectorAll('style')).map(style => {
        const regex = /url\((.*?)\)/gm;
        const match = regex.exec(style.innerHTML);
        const url = match ? match[1] : '';
        return url;
      }).filter(url => !!url)?.[0] || '';
      const fonts = {
        family: window.getComputedStyle(document.body).fontFamily,
        variants: window.getComputedStyle(document.body).fontWeight,
        letterSpacings: window.getComputedStyle(document.body).letterSpacing,
        fontWeight: window.getComputedStyle(document.body).fontWeight,
        url,
      };

      const primaryButton = document.querySelector('form[action*="/cart/add"] button');
      const buttonStyle = primaryButton ? window.getComputedStyle(primaryButton) : null;
      
      return {
        fonts: fonts,
        primaryButton: {
          fontFamily: buttonStyle?.fontFamily,
          fontSize: buttonStyle?.fontSize,
          lineHeight: buttonStyle?.lineHeight,
          letterSpacing: buttonStyle?.letterSpacing,
          textTransform: buttonStyle?.textTransform,
          textDecoration: buttonStyle?.textDecoration,
          textAlign: buttonStyle?.textAlign,
          backgroundColor: buttonStyle?.backgroundColor,
          color: buttonStyle?.color,
          borderColor: buttonStyle?.borderColor,
          borderWidth: buttonStyle?.borderWidth,
          borderRadius: buttonStyle?.borderRadius
        }
      }
    });

    await browser.close();
    res.json(result);
  } catch(error) {
    console.error(error);
    res.status(500).send({ error: 'An error occured!' });
  }
})

app.listen(port, () => console.log(`App listening on port ${port}`))