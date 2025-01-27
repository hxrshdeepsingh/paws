const Post = require('../models/postModel')
const User = require('../models/userModel')
const { v4: uuidv4 } = require('uuid')

// @public
const getPosts = async (req, res) => {
	try {
		const post = await Post.find().select('-_id -uid')
		return res.status(200).json(post)
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'An error occurred', error: error.message })
	}
}

// @public
const getPost = async (req, res) => {
	const { postId } = req.params
	try {
		const post = await Post.findOne({ postId: postId }).select('-_id -uid')

		if (!post) {
			return res.status(404).json({ message: 'Post not found' })
		}
		return res.status(200).json(post)
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'An error occurred', error: error.message })
	}
}

// @public
const getUserPosts = async (req, res) => {
	const { postId } = req.params
	try {
		const post = await Post.find({ userId: postId }).select('-_id')
		if (!post) {
			return res.status(404).json({ message: 'Posts not found, try again' })
		} else {
			return res.status(200).json(post)
		}
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'An error occurred', error: error.message })
	}
}

// @protected
const createPost = async (req, res) => {
	const { name, description, age, gender, breed, species, weight, vaccinated } =
		req.body
	const { token } = req
	const uuid = uuidv4()
	try {
		const match = await User.findOne({ _id: token.private_id })

		if (match) {
			const post = new Post({
				name: name,
				description: description,
				age: age,
				gender: gender,
				breed: breed,
				species: species,
				weight: weight,
				vaccinated: vaccinated,

				username: match.username,
				state: match.state,
				address: match.address,
				number: match.number,
				email: match.email,

				userId: token.public_id,
				postId: uuid,
			})
			await post.save()
			return res.status(200).json({ message: 'post created' })
		}

		return res.status(403).json({ message: 'User not found or not allowed' })
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'An error occurred', error: error.message })
	}
}

// @protected
const updatePost = async (req, res) => {
	const { token } = req
	const { data } = req.body
	try {
		const updatedPost = await Post.findOneAndUpdate(
			{ postId: data.postId, userId: token.public_id },
			{ $set: data.data },
			{ new: true },
		)
		if (!updatedPost) {
			return res.status(404).json({
				message: 'Post not found or user does not have permission',
			})
		}
		return res.status(200).json({ message: 'post updated' })
	} catch {
		return res.status(500).json({ message: 'error occurred here' })
	}
}

// @protected
const deletePost = async (req, res) => {
	const { token } = req
	const { postId } = req.params
	try {
		const post = await Post.findOne({ userId: token.public_id, postId: postId })
		if (post) {
			await post.deleteOne()
			return res.status(200).json({ message: 'Post deleted' })
		} else {
			return res.status(404).json({ message: 'Post not found' })
		}
	} catch (error) {
		return res.status(500).json({ message: 'An error occurred' })
	}
}

module.exports = {
	getPost,
	getPosts,
	createPost,
	updatePost,
	deletePost,
	getUserPosts,
}
