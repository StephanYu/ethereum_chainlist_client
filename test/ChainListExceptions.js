const ChainList = artifacts.require('./ChainList');

contract('ChainList', async (accounts) => {
  let chainListInstance;
  let seller = accounts[1];
  let buyer = accounts[2];
  let articleName = "article 1";
  let articleDescription = "Description for article 1";
  let articlePrice = 10;

  it('throws an exception when trying to buy an article when there is no article for sale yet', async () => {
      let instance = await ChainList.deployed();

      try {
        await instance.buyArticle(1, {
          from: buyer,
          value: web3.toWei(articlePrice, 'ether')
        });
        assert(false);
      } catch(err) {
        assert(true);
      }

      let data = await instance.getNumberOfArticles();
      assert.equal(data.toNumber(), 0, 'number of articles must be 0');
  });

  it('throws an exception when trying to buy a non-existing article', async () => {
    let instance = await ChainList.deployed();
    await instance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, 'ether'), { from: seller });

    try {
      await instance.buyArticle(2, {
        from: buyer,
        value: web3.toWei(articlePrice, 'ether')
      });
      assert(false);
    } catch(err) {
      assert(true);
    }
  });

  it('throws an exception when the seller tries to buy their own article', async () => {
    let instance = await ChainList.deployed();
    await instance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, 'ether'), { from: seller});

    try {
      await instance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice, 'ether')});
      assert(false);
    } catch(err) {
      assert(true);
    }

    let data = await instance.articles(1);
    assert.equal(data[0].toNumber(), 1, 'article id must be 1');
    assert.equal(data[1], seller, 'seller must be ' + seller);
    assert.equal(data[2], 0x0, 'buyer must be empty');
    assert.equal(data[3], articleName, 'article name must be ' + articleName);
    assert.equal(data[4], articleDescription, 'article description must be ' + articleDescription);
    assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'article price must be ' + web3.toWei(articlePrice, 'ether'));
  });

  it('throws an exception if the purchase price is different from its selling price', async() => {
    let instance = await ChainList.deployed();
    let wrongPrice = articlePrice + 1;

    try {
      await instance.buyArticle(1, {from: seller, value: web3.toWei(wrongPrice, 'ether')});
      assert(false);
    } catch(err) {
      assert(true);
    }

    let data = await instance.articles(1);
    assert.equal(data[0].toNumber(), 1, 'article id must be 1');
    assert.equal(data[1], seller, 'seller must be ' + seller);
    assert.equal(data[2], 0x0, 'buyer must be empty');
    assert.equal(data[3], articleName, 'article name must be ' + articleName);
    assert.equal(data[4], articleDescription, 'article description must be ' + articleDescription);
    assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'article price must be ' + web3.toWei(articlePrice, 'ether'));
  });

  it('throws an exception if you try to buy an article that has already been sold', async() => {
    let instance = await ChainList.deployed();

    try {
      await instance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice, 'ether')});
      await instance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice, 'ether')});
      assert(false);
    } catch(err) {
      assert(true);
    }

    let data = await instance.articles(1);
    assert.equal(data[0].toNumber(), 1, 'article id must be 1');
    assert.equal(data[1], seller, 'seller must be ' + seller);
    assert.equal(data[2], buyer, 'buyer must be' + buyer);
    assert.equal(data[3], articleName, 'article name must be ' + articleName);
    assert.equal(data[4], articleDescription, 'article description must be ' + articleDescription);
    assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), 'article price must be ' + web3.toWei(articlePrice, 'ether'));
  });
});
