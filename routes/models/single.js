const data = require('../../data.json');


module.exports = (req, res) =>  {
  console.log(req.params);
  const modelId = req.params.modelId * 1;
  const model = data.models.find(m => m.id === modelId);

  res.status(200).json({ model });

};
