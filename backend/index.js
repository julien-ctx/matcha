const express = require('express')
const PORT = 3000

const app = express()
app.use(express.json())

app.listen(PORT, () => {
	console.log(`Server Started at ${3000}`)
})

app.get('/', (req, res) => {
	res.send('Hello World!')
})
