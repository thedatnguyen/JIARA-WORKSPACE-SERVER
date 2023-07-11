const {db} = require("../configs/firebase");

module.exports.updateEntry = async (req, res) => {
  const {body: {text, title}, params: {entryId}} = req;

  console.log("get \"http://127.0.0.1:5001/fir-demo-13f7a/us-central1/app/update-entry/:entryId\"");

  try {
    const entry = db.collection("entries").doc(entryId);
    const currentData = (await entry.get()).data() || {};
    const entryObject = {
      title: title || currentData.title,
      text: text || currentData.text,
    };

    await entry.set(entryObject).catch((error) => {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    });

    return res.status(200).json({
      status: "success",
      message: "entry updated successfully",
      data: entryObject,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
