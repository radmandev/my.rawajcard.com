import React, { useState } from'react';
import { 
 User, 
 Briefcase, 
 Building, 
 FileText, 
 Phone, 
 Mail, 
 MessageCircle,
 MapPin,
 QrCode,
 Share2,
 Camera,
 ImageIcon,
 Minus,
 Space
} from'lucide-react';
import { Input } from'@/components/ui/input';
import { ScrollArea } from'@/components/ui/scroll-area';

export default function ElementsLibrary({ onAddElement, theme }) {
 const [searchQuery, setSearchQuery] = useState('');

 const elementCategories = [
 {
 name:'Basic Info',
 elements: [
 { type:'name', label:'Name', icon: User, description:'Full name field' },
 { type:'title', label:'Job Title', icon: Briefcase, description:'Job position' },
 { type:'company', label:'Company', icon: Building, description:'Company name' },
 { type:'bio', label:'Bio', icon: FileText, description:'About section' },
 { type:'location', label:'Location', icon: MapPin, description:'Address/Location' }
 ]
 },
 {
 name:'Media',
 elements: [
 { type:'profile_image', label:'Profile Image', icon: User, description:'Profile photo' },
 { type:'cover_image', label:'Cover Image', icon: ImageIcon, description:'Header background' },
 { type:'logo', label:'Logo', icon: Camera, description:'Company logo' }
 ]
 },
 {
 name:'Contact Actions',
 elements: [
 { type:'contact_button', label:'Call Button', icon: Phone, description:'Phone call action' },
 { type:'email_button', label:'Email Button', icon: Mail, description:'Send email action' },
 { type:'whatsapp_button', label:'WhatsApp', icon: MessageCircle, description:'WhatsApp chat' }
 ]
 },
 {
 name:'Social',
 elements: [
 { type:'social_links', label:'Social Links', icon: Share2, description:'Social media icons' }
 ]
 },
 {
 name:'Smart Components',
 elements: [
 { type:'qr_code', label:'QR Code', icon: QrCode, description:'Dynamic QR code' }
 ]
 },
 {
 name:'Layout',
 elements: [
 { type:'spacer', label:'Spacer', icon: Space, description:'Empty space' },
 { type:'divider', label:'Divider', icon: Minus, description:'Horizontal line' }
 ]
 }
 ];

 const filteredCategories = elementCategories.map(category => ({
 ...category,
 elements: category.elements.filter(el =>
 el.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
 el.description.toLowerCase().includes(searchQuery.toLowerCase())
 )
 })).filter(category => category.elements.length > 0);

 return (
 <div className="w-80 bg-indigo-950/60 border-r border-slate-200 flex flex-col">
 <div className="p-4 border-b border-slate-200">
 <h2 className="text-lg font-semibold mb-3">Elements</h2>
 <Input
 placeholder="Search elements..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="mb-2"
 />
 </div>

 <ScrollArea className="flex-1">
 <div className="p-4 space-y-6">
 {filteredCategories.map((category) => (
 <div key={category.name}>
 <h3 className="text-sm font-semibold text-slate-600 mb-2">
 {category.name}
 </h3>
 <div className="grid grid-cols-2 gap-2">
 {category.elements.map((element) => {
 const Icon = element.icon;
 return (
 <button
 key={element.type}
 onClick={() => onAddElement(element.type)}
 className="p-3 border-2 border-slate-200 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all flex flex-col items-center gap-2 group"
 >
 <Icon className="h-6 w-6 text-slate-600 group-hover:text-cyan-600" />
 <span className="text-xs text-center">{element.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </ScrollArea>

 {/* Dynamic Fields Info */}
 <div className="p-4 border-t border-slate-200 bg-cyan-50">
 <p className="text-xs text-slate-600">
 💡 Elements use dynamic fields like <code>{'{{name}}'}</code> that auto-fill with user data
 </p>
 </div>
 </div>
 );
}