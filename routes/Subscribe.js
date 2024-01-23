const express = require('express');
const Subscribe = require('../models/Subscribe');
const router = express.Router();
const AdminMiddleware= require("../middlewares/AdminAuthorization_middleware")


// Example of a protected route
router.get('/',AdminMiddleware,async (req, res) => {
    try {
        const Data = await Subscribe.find({}); 
        res.status(200).send({"Subscribe":Data});
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/create', async (req, res) => {
    const { email } = req.body;
 
    try {
        // Create a new OTP
        const newSubscribe = new Subscribe({ email});

        await newSubscribe.save();
        res.status(200).send({ message: 'Subscribed' });
    } catch (error) {
        res.status(500).send({ message: 'Error Subscribe', error });
    }
});



// DELETE route to delete a subscription
router.delete('/subscribe/:subscribeId', AdminMiddleware, async (req, res) => {
    const subscribeId = req.params.subscribeId;

    try {
        // Assuming Subscribe is a separate model from Subscribe
        const subscribedData = await Subscribe.findOne({ _id: subscribeId });
        if (!subscribedData) {
            return res.status(404).send('Subscription data not found');
        }

        await Subscribe.deleteOne({ _id: subscribeId });
        res.send('Subscription deleted successfully');
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Internal Server Error');
    }
});


// DELETE route to delete an event
router.delete('/bulk',AdminMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
    
        if (!ids || ids.length === 0) {
          return res.status(400).send({ message: 'No IDs provided' });
        }
    
        // Delete events with IDs in the provided array
        await Subscribe.deleteMany({ _id: { $in: ids } });
    
        res.status(200).send({ message: 'Events deleted successfully' });
      } catch (err) {
        console.error('Error during bulk deletion:', err);
        res.status(500).send({ message: 'Error during bulk deletion' });
      }
});




module.exports = router;
