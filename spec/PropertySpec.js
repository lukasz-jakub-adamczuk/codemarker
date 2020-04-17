describe("Property", function() {
  var property;
  var name;
  var label;
  var value;
  var params;

  beforeEach(function() {
      value = 'abc';
    params = {
        'name': 'test',
        'label': 'Test',
        'value': 'abc'
    };
    property = new Property(params);
  });

  it("should return property value", function() {
    expect(property.getValue()).toEqual(value);
  });

});
