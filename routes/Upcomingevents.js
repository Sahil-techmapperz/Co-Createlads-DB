const express = require('express');
const Upcomingevents = require('../models/Upcomingevents');
const router = express.Router();
const AdminMiddleware= require("../middlewares/AdminAuthorization_middleware");
const ImageUploadMiddleware = require("../middlewares/ImageUpload");


// Example of a protected route
router.get('/',async (req, res) => {
    try {
        const Data = await Upcomingevents.find({}); 
        res.status(200).send({"Upcomingevents":Data});
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/create',AdminMiddleware,ImageUploadMiddleware, async (req, res) => {

    try {
        // Create a new OTP
        const newUpcomingevents = new Upcomingevents(req.body);

        await newUpcomingevents.save();
        res.status(200).send({ message: 'Upcomingevents Created Successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error Upcomingevents', error });
    }
});


router.patch('/edit/:UpcomingeventsId', AdminMiddleware, ImageUploadMiddleware, async (req, res) => {
    try {
        const id = req.params.UpcomingeventsId;
        let updateData = { ...req.body };

        

        // Check for empty update object
        if (Object.keys(updateData).length === 0) {
            return res.status(400).send('No update data provided.');
        }

        // Check if the document exists before updating
        const UpcomingeventsExists = await Upcomingevents.exists({ _id: id });
        if (!UpcomingeventsExists) {
            return res.status(404).send('Upcomingevents not found.');
        }

        // Update the Upcomingevents document
        const updateResult = await Upcomingevents.updateOne({ _id: id }, { $set: updateData });
        if (!updateResult.modifiedCount) {
            throw new Error("Upcomingevents update failed or no changes made.");
        }

        res.status(200).send({ "message": "Upcomingevents updated successfully" });
    } catch (error) {
        console.error("Error updating Upcomingevents:", error.message);
        res.status(500).send(error.message);
    }
});



// DELETE route to delete a subscription
router.delete('/delete/:UpcomingeventsId',AdminMiddleware, async (req, res) => {
    const UpcomingeventsId = req.params.UpcomingeventsId;  
    try {
        // Assuming Upcomingevents is a separate model from Upcomingevents
        const UpcomingeventsdData = await Upcomingevents.findOne({ _id: UpcomingeventsId });
        if (!UpcomingeventsdData) {
            return res.status(404).send('Subscription data not found');
        }

        await Upcomingevents.deleteOne({ _id: UpcomingeventsId });
        res.status(200).send('Upcomingevents deleted successfully');
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send('Internal Server Error');
    }
});







module.exports = router;
