class PaymentsController < ActionController::Base
	def create
		begin
			@response = RestClient.post "http://host.docker.internal:3000/checkout/#{order_id}", :content_type => 'application/json'
		rescue RestClient::Conflict => e
			flash["danger"] = "Przepraszamy, zamówienie nie mogło zostać opłacone z powodu niewystarczających środków na koncie."
			redirect_to "/search" and return
		rescue => e
			flash["danger"] = "Przepraszamy, zamówienie nie mogło zostać opłacone."
			redirect_to "/search" and return
		end
		flash["success"] = "Zamówienie zostało opłacone"
		redirect_to "/payments/#{order_id}"
	end

	def show
		@order_id = order_id
	end

	private

	def order_id
		params["order_id"]
	end
end