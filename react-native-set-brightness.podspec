require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-set-brightness"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/mhmmtysil/react-native-set-brightness"
  s.license      = package["license"]
  s.authors      = package["author"]
  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "https://github.com/mhmmtysil/react-native-set-brightness.git", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true

  if defined?(install_modules_dependencies)
    install_modules_dependencies(s)
  else
    s.dependency "React-Core"
  end
end
