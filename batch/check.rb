require 'net/http'

Net::HTTP.get_print(URI.parse('https://disposable-markdown.herokuapp.com/'))
