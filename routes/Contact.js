const express = require('express');
const Contact = require('../models/Contact');
const router = express.Router();
const AdminMiddleware= require("../middlewares/AdminAuthorization_middleware")


// Example of a protected route
router.get('/',AdminMiddleware,async (req, res) => {
    try {
        const Data = await Contact.find({}); 
        res.status(200).send({"Contact":Data});
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/create', async (req, res) => {

 
    try {
        // Create a new OTP
        const newContact = new Contact(req.body);

        await newContact.save();
        res.status(200).send({ message: 'Contact Created Successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error Contact', error });
    }
});



// DELETE route to delete a subscription
router.delete('/delete/:ContactId', AdminMiddleware, async (req, res) => {
    const ContactId = req.params.ContactId;

    try {
        // Assuming Contact is a separate model from Contact
        const ContactdData = await Contact.findOne({ _id: ContactId });
        if (!ContactdData) {
            return res.status(404).send('Subscription data not found');
        }

        await Contact.deleteOne({ _id: ContactId });
        res.send('Contact deleted successfully');
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Internal Server Error');
    }
});


// DELETE route to delete an event
router.delete('/bulkdelete',AdminMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
    
        if (!ids || ids.length === 0) {
          return res.status(400).send({ message: 'No IDs provided' });
        }
    
        // Delete Contact with IDs in the provided array
        await Contact.deleteMany({ _id: { $in: ids } });
    
        res.status(200).send({ message: 'Contact deleted successfully' });
      } catch (err) {
        console.error('Error during bulk deletion:', err);
        res.status(500).send({ message: 'Error during bulk deletion' });
      }
});




module.exports = router;
