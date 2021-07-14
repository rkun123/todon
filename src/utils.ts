import textVersion from 'textversionjs'
import { createCanvas, loadImage, NodeCanvasRenderingContext2D, registerFont } from 'canvas' 
import path from 'path'
import fs from 'fs'

export function escapeTagFromContent(html: string) {
	return textVersion(html, {
		linkProcess: (_, linkText) => (linkText)
	}).replace('@todon', '').replace(/(^ )|( $)/, '')
}

function wrapText(context: NodeCanvasRenderingContext2D, text: string, width: number, height: number, maxWidth: number, lineHeight: number) {
	const words = text.split('')
	console.debug(words.length)
	let nextX = 0
	let nextY = 0
	const lines: string[] = ['']
	let idx = 0
	let textWidth: number = 0
	let textHeight: number = 0

	for(var n = 0; n < words.length; n++) {
		var metrics = context.measureText(words[n]);
		var testWidth = metrics.width;

		if (idx === 0) textWidth += testWidth

		if (nextX + testWidth > maxWidth && n > 0) {
			// break line
			console.debug('break at', n)
			nextY += lineHeight * 1.1
			nextX = 0
			idx++
			lines[idx] = ''
		}
		else {
		}
		// context.fillText(words[n], nextX + x, nextY + y);
		lines[idx] += words[n]
		nextX += testWidth
	}
	// context.fillText(line, x, y);
	textHeight = (idx+1) * lineHeight * 1.1

	const calcX = width / 2 - textWidth / 2
	const calcY = height / 2 - textHeight  / 2 + lineHeight*0.1

	lines.forEach((line, idx) => {
		context.fillText(line, calcX, calcY + lineHeight*1.1*idx)
	})
}

function dataURLToBuffer(dataURL: string) {
	const buffer = Buffer.from(dataURL.split(',')[1], 'base64')
	//const buffer = dataURL.split(',')[1]
	return buffer
}

export async function generateTodoCard(text: string, finished: boolean) {
	const width = 960, height = 540
	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')

	// register font
	registerFont(path.join(__dirname, '../static/NotoSansJP-Bold.otf'), {
		family: 'noto-sans-cjk'
	})

	// load image
	const image = await loadImage(path.join(__dirname, '../static/boilerplate.png'))
	ctx.drawImage(image, 0, 0, width, height)
	ctx.font = '40px noto-sans-cjk'
	wrapText(ctx, text, width, height, width - 40 - 40, 40)
	//fs.writeFileSync(path.join(__dirname, '../static/image.png'), canvas.toBuffer())

	if(finished) {
		ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
		ctx.fillRect(0, 0, width, height)
		const thumbsUpWidth = 300, thumbsUpHeight = 300
		const thumbsUpImage = await loadImage(path.join(__dirname, '../static/thumbs-up.svg'))
		ctx.drawImage(thumbsUpImage, width / 2 - thumbsUpWidth / 2, height / 2 - thumbsUpHeight / 2, thumbsUpWidth, thumbsUpHeight)
	}
	return canvas.toDataURL()
}