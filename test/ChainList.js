const ChainList = artifacts.require('./ChainList');

contract('ChainList', async (accounts) => {
  let instance;
  let seller = accounts[1];
  let buyer = accounts[2];
  let articleName1 = "article 1";
  let articleDescription1 = "Description for article 1";
  let articlePrice1 = 10;
  let articleName2 = "article 2";
  let articleDescription2 = "Description for article 2";
  let articlePrice2 = 20;
  let sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  let buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it('should be initialised with empty values', async () => {
    instance = await ChainList.deployed();
    let articles = await instance.getNumberOfArticles();
    let articlesForSale = await instance.getArticlesForSale();

    assert.equal(articles.toNumber(), 0, 'number of articles must be zero');
    assert.equal(articlesForSale.length, 0, "there shouldn't be any article for sale");
  });

  it('should let us sell a first article', async () => {
    instance = await ChainList.deployed();
    let receipt = await instance.sellArticle(
      articleName1,
      articleDescription1,
      web3.toWei(articlePrice1, 'ether'),
      { from: seller }
    );
    let logs = receipt.logs;

    // check event
    assert.equal(logs.length, 1, 'one event should have been triggered');
    assert.equal(logs[0].event, 'LogSellArticle', 'event should be LogSellArticle');
    assert.equal(logs[0].args._id.toNumber(), 1, 'id must be 1');
    assert.equal(logs[0].args._seller, seller, 'event seller must be ' + seller);
    assert.equal(logs[0].args._name, articleName1, 'event article name must be ' + articleName1);
    assert.equal(logs[0].args._price.toNumber(), web3.toWei(articlePrice1, 'ether'), 'event article price must be ' + web3.toWei(articlePrice1, 'ether'));

    let articlesNumber = await instance.getNumberOfArticles();
    assert.equal(articlesNumber, 1, 'number of articles must be one');

    let articlesForSale = await instance.getArticlesForSale();
    assert.equal(articlesForSale.length, 1, 'there must be one article for sale');
    assert.equal(articlesForSale[0].toNumber(), 1, 'article id must be 1');

    let firstArticle = await instance.articles(articlesForSale[0]);
    assert.equal(firstArticle[0].toNumber(), 1, 'article id must be 1');
    assert.equal(firstArticle[1], seller, 'seller must be ' + seller);
    assert.equal(firstArticle[2], 0x0, 'buyer must be empty');
    assert.equal(firstArticle[3], articleName1, 'article name must be ' + articleName1);
    assert.equal(firstArticle[4], articleDescription1, 'article description must be ' + articleDescription1);
    assert.equal(firstArticle[5].toNumber(), web3.toWei(articlePrice1, 'ether'), 'article price must be ' + web3.toWei(articlePrice1, 'ether'));
  });

  it('should let us sell a second article', async () => {
    instance = await ChainList.deployed();
    let receipt = await instance.sellArticle(
      articleName2,
      articleDescription2,
      web3.toWei(articlePrice2, 'ether'),
      {from: seller}
    );
    let logs = receipt.logs;

    // check event
    assert.equal(logs.length, 1, 'one event should have been triggered');
    assert.equal(logs[0].event, 'LogSellArticle', 'event should be LogSellArticle');
    assert.equal(logs[0].args._id.toNumber(), 2, 'id must be 2');
    assert.equal(logs[0].args._seller, seller, 'event seller must be ' + seller);
    assert.equal(logs[0].args._name, articleName2, 'event article name must be ' + articleName2);
    assert.equal(logs[0].args._price.toNumber(), web3.toWei(articlePrice2, 'ether'), 'event article price must be ' + web3.toWei(articlePrice2, 'ether'));

    let articlesNumber = await instance.getNumberOfArticles();
    assert.equal(articlesNumber, 2, 'number of articles must be two');

    let articlesForSale = await instance.getArticlesForSale();
    assert.equal(articlesForSale.length, 2, 'there must be two article for sale');
    assert.equal(articlesForSale[1].toNumber(), 2, 'article id must be 2');

    let secondArticle = await instance.articles(articlesForSale[1]);
    assert.equal(secondArticle[0].toNumber(), 2, 'article id must be 2');
    assert.equal(secondArticle[1], seller, 'seller must be ' + seller);
    assert.equal(secondArticle[2], 0x0, 'buyer must be empty');
    assert.equal(secondArticle[3], articleName2, 'article name must be ' + articleName2);
    assert.equal(secondArticle[4], articleDescription2, 'article description must be ' + articleDescription2);
    assert.equal(secondArticle[5].toNumber(), web3.toWei(articlePrice2, 'ether'), 'article price must be ' + web3.toWei(articlePrice2, 'ether'));
  });

  it('should buy an article', async () => {
    instance = await ChainList.deployed();
    sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), 'ether').toNumber();
    buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), 'ether').toNumber();

    let receipt = await instance.buyArticle(1, {
      from: buyer,
      value: web3.toWei(articlePrice1, 'ether')
    });
    let logs = receipt.logs;

    assert.equal(logs.length, 1, 'one event should have been triggered');
    assert.equal(logs[0].event, 'LogBuyArticle', 'event should be LogBuyArticle');
    assert.equal(logs[0].args._id.toNumber(), 1, 'article id must be 1');
    assert.equal(logs[0].args._seller, seller, 'event seller must be ' + seller);
    assert.equal(logs[0].args._buyer, buyer, 'event buyer must be ' + buyer);
    assert.equal(logs[0].args._name, articleName1, 'event article name must be ' + articleName1);
    assert.equal(logs[0].args._price.toNumber(), web3.toWei(articlePrice1, 'ether'), 'event article price must be ' + web3.toWei(articlePrice1, 'ether'));

    sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), 'ether').toNumber();
    buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), 'ether').toNumber();

    assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, 'seller should have earned ' + articlePrice1 + ' ETH');
    assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, 'buyer should have spent ' + articlePrice1 + ' ETH');

    let articlesNumber = await instance.getNumberOfArticles();
    assert.equal(articlesNumber, 2, 'number of articles must be two');

    let articlesForSale = await instance.getArticlesForSale();
    assert.equal(articlesForSale.length, 1, 'there should now be only 1 article left for sale');
    assert.equal(articlesForSale[0].toNumber(), 2, 'article 2 should be the only article left for sale');
  });
});
