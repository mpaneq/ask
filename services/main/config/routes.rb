Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "application#hello"
  resources :search, only: [:index, :show]
  resources :products, only: [:show, :create]
  resources :orders
  resources :payments
  resources :invoices
end
