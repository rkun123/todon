const path = require('path')
module.exports = {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.js', '.ts', '.json']
	},
	entry: {
		index: path.join(__dirname, './src/index.ts')
	},
	experiments: {
		topLevelAwait: true
	},
}