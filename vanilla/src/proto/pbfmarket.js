'use strict'; // code generated by pbf v3.2.1

// Pair ========================================

var Pair = exports.Pair = {};

Pair.read = function (pbf, end) {
    return pbf.readFields(Pair._readField, {symbol: "", id: 0, prices: [], times: [], orders: [], indicators: []}, end);
};
Pair._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.symbol = pbf.readString();
    else if (tag === 2) obj.id = pbf.readVarint(true);
    else if (tag === 3) pbf.readPackedFloat(obj.prices);
    else if (tag === 4) pbf.readPackedVarint(obj.times, true);
    else if (tag === 5) obj.orders.push(Pair.Order.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) obj.indicators.push(Pair.Indicator.read(pbf, pbf.readVarint() + pbf.pos));
};
Pair.write = function (obj, pbf) {
    if (obj.symbol) pbf.writeStringField(1, obj.symbol);
    if (obj.id) pbf.writeVarintField(2, obj.id);
    if (obj.prices) pbf.writePackedFloat(3, obj.prices);
    if (obj.times) pbf.writePackedVarint(4, obj.times);
    if (obj.orders) for (var i = 0; i < obj.orders.length; i++) pbf.writeMessage(5, Pair.Order.write, obj.orders[i]);
    if (obj.indicators) for (i = 0; i < obj.indicators.length; i++) pbf.writeMessage(6, Pair.Indicator.write, obj.indicators[i]);
};

// Pair.Order ========================================

Pair.Order = {};

Pair.Order.read = function (pbf, end) {
    return pbf.readFields(Pair.Order._readField, {price: 0, quantity: 0, at: 0}, end);
};
Pair.Order._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.price = pbf.readVarint(true);
    else if (tag === 2) obj.quantity = pbf.readVarint(true);
    else if (tag === 3) obj.at = pbf.readVarint(true);
};
Pair.Order.write = function (obj, pbf) {
    if (obj.price) pbf.writeVarintField(1, obj.price);
    if (obj.quantity) pbf.writeVarintField(2, obj.quantity);
    if (obj.at) pbf.writeVarintField(3, obj.at);
};

// Pair.Indicator ========================================

Pair.Indicator = {};

Pair.Indicator.read = function (pbf, end) {
    return pbf.readFields(Pair.Indicator._readField, {price: [], times: 0}, end);
};
Pair.Indicator._readField = function (tag, obj, pbf) {
    if (tag === 1) pbf.readPackedVarint(obj.price, true);
    else if (tag === 2) obj.times = pbf.readVarint(true);
};
Pair.Indicator.write = function (obj, pbf) {
    if (obj.price) pbf.writePackedVarint(1, obj.price);
    if (obj.times) pbf.writeVarintField(2, obj.times);
};

// Market ========================================

var Market = exports.Market = {};

Market.read = function (pbf, end) {
    return pbf.readFields(Market._readField, {pairs: []}, end);
};
Market._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.pairs.push(Pair.read(pbf, pbf.readVarint() + pbf.pos));
};
Market.write = function (obj, pbf) {
    if (obj.pairs) for (var i = 0; i < obj.pairs.length; i++) pbf.writeMessage(1, Pair.write, obj.pairs[i]);
};
