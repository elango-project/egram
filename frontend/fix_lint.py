import re

def replace_in_file(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"d:\project\interview level\egram\frontend\src"

# AppLayout.jsx
replace_in_file(f"{base_dir}/components/Layout/AppLayout.jsx", "Menu, X, ", "Menu, ")
replace_in_file(f"{base_dir}/components/Layout/AppLayout.jsx", " Menu, X }", " Menu }")

# AIHub.jsx
replace_in_file(f"{base_dir}/pages/AIHub/AIHub.jsx", "const TABS = [", "// const TABS = [")

# CourseDetail.jsx
replace_in_file(f"{base_dir}/pages/Courses/CourseDetail.jsx", "BookOpen, ", "")
replace_in_file(f"{base_dir}/pages/Courses/CourseDetail.jsx", " Lock }", " }")

# Dashboard.jsx
replace_in_file(f"{base_dir}/pages/Dashboard/Dashboard.jsx", "import { internshipApi }", "// import { internshipApi }")
replace_in_file(f"{base_dir}/pages/Dashboard/Dashboard.jsx", "TrendingUp, ", "")
replace_in_file(f"{base_dir}/pages/Dashboard/Dashboard.jsx", "const { user } = useAuthStore();", "const { } = useAuthStore();")

# Events.jsx
replace_in_file(f"{base_dir}/pages/Events/Events.jsx", " Tag, ", " ")
replace_in_file(f"{base_dir}/pages/Events/Events.jsx", " Trophy, ", " ")
replace_in_file(f"{base_dir}/pages/Events/Events.jsx", " Zap }", " }")

# Internships.jsx
replace_in_file(f"{base_dir}/pages/Internship/Internships.jsx", " Filter }", " }")

# Profile.jsx
replace_in_file(f"{base_dir}/pages/Profile/Profile.jsx", "User, ", "")

# Projects.jsx
replace_in_file(f"{base_dir}/pages/Projects/Projects.jsx", " Tag }", " }")

# Reels.jsx
replace_in_file(f"{base_dir}/pages/Reels/Reels.jsx", "useRef, ", "")
replace_in_file(f"{base_dir}/pages/Reels/Reels.jsx", "import { aiApi }", "// import { aiApi }")

print("Fixed lint errors")
