class SearchController < ActionController::Base
    def index
        @results = get_results
        @results = @results.select { |result| result.category == params["category"] } if params["category"].present?
        @results = @results.select { |result| result.price < params["price_to"].to_f } if params["price_to"].present?
    end

    private

    def get_results
        [
        OpenStruct.new(id: 1, name: "Cegła (szt.)", category: "Materiały budowlane", quantity: 10, price: 0.80),
         OpenStruct.new(id: 2, name: "NVIDIA RTX 3090Ti", category: "Elektronika", quantity: 15, price: 2983.00),
         OpenStruct.new(id: 3, name: "Zestaw Lego Rynek Glówny", category: "Rozrywka", quantity: 13, price: 180.00),
         OpenStruct.new(id: 4, name: "Captain Morgan Spiced Gold", category: "Alkohole", quantity: 1, price: 59.20),
         OpenStruct.new(id: 1, name: "Cegła (szt.)", category: "Materiały budowlane", quantity: 10, price: 0.80),
         OpenStruct.new(id: 2, name: "NVIDIA RTX 3090Ti", category: "Elektronika", quantity: 15, price: 2983.00),
         OpenStruct.new(id: 3, name: "Zestaw Lego Warszawska Starówka", category: "Rozrywka", quantity: 13, price: 200.00),
         OpenStruct.new(id: 4, name: "Captain Morgan Spiced Gold", category: "Alkohole", quantity: 1, price: 59.20)
        ]
    end
end