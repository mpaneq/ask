class OrdersController < ActionController::Base
	def create
		begin
			create_order
		rescue => e
			flash["danger"] = "Coś poszło nie tak"
			redirect_to "/search" and return
		end
		flash["success"] = "Dodano produkt do zamówienia"
		redirect_to "/search"
	end

	def show
		@order = begin
			JSON.parse get_order
		rescue => e 
			nil
		end
	end

	def edit
		begin
			RestClient.put "http://host.docker.internal:3002/remove?order_id=#{params["order_id"]}&item_id=#{params["item_id"]}", :content_type => 'application/json'
		rescue => e 
			flash[:danger] = "Przepraszamy, nie udało się usunąć pozycji."
			redirect_to "/orders/#{params["order_id"]}" and return
		end
		flash[:success] = "Pozycja została usunięta poprawnie"
		redirect_to "/orders/#{params["order_id"]}" and return
	end

	private 
	
	def create_order
		open_new_order if user_has_no_opened_orders?
		add_product_to_order
	end

	def user_id
		4
	end

	def add_product_to_order
		RestClient.put add_order_url, :content_type => 'application/json'
	end

	def add_order_url
		if params["quantity"].present?
			"http://host.docker.internal:3002/add?order_id=#{parsed_response["id"]}&item_id=#{item_id}&quantity=#{params["quantity"]}"
		else
			"http://host.docker.internal:3002/add?order_id=#{parsed_response["id"]}&item_id=#{item_id}"
		end
	end

	def user_has_no_opened_orders?
		get_order
		return true if @response.code == 204
		false
	end
	
	def get_order
		@response = RestClient.get "http://host.docker.internal:3002?user_id=#{user_id}", :content_type => 'application/json'
	end

	def parsed_response
		JSON.parse(@response)
	end

	def open_new_order
		@response = RestClient.post "http://host.docker.internal:3002?user_id=#{user_id}", :content_type => 'application/json'
	end

	def item_id
		params["id"]
	end
end
