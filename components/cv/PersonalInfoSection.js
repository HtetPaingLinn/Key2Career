import React from "react";

export default function PersonalInfoSection({ data, onChange, twoColumnLayout }) {
  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-lg font-bold font-lexend mb-2">Personal Information</h2>
      <div className={`grid ${twoColumnLayout ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <div>
          <label className="block text-xs font-medium mb-1">First Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. John"
            value={data.firstName || ""}
            onChange={e => onChange({ ...data, firstName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Last Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. Doe"
            value={data.lastName || ""}
            onChange={e => onChange({ ...data, lastName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. john.doe@email.com"
            value={data.email || ""}
            onChange={e => onChange({ ...data, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Phone</label>
          <input
            type="tel"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. +1234567890"
            value={data.phone || ""}
            onChange={e => onChange({ ...data, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Address</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. 123 Main St, City, Country"
            value={data.address || ""}
            onChange={e => onChange({ ...data, address: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Date of Birth</label>
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            value={data.dateOfBirth || ""}
            onChange={e => onChange({ ...data, dateOfBirth: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Nationality</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. American"
            value={data.nationality || ""}
            onChange={e => onChange({ ...data, nationality: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">LinkedIn</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. linkedin.com/in/username"
            value={data.linkedin || ""}
            onChange={e => onChange({ ...data, linkedin: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Website</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. johndoe.com"
            value={data.website || ""}
            onChange={e => onChange({ ...data, website: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Driving License</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. B, C1, D"
            value={data.drivingLicense || ""}
            onChange={e => onChange({ ...data, drivingLicense: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Bio</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Short headline (e.g. UI/UX Designer)"
          value={data.bio || ""}
          onChange={e => onChange({ ...data, bio: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-dmsans focus:outline-none focus:ring-2 focus:ring-green-400 min-h-[80px]"
          placeholder="A short summary about yourself, your goals, and what makes you unique."
          value={data.description || ""}
          onChange={e => onChange({ ...data, description: e.target.value })}
        />
      </div>
    </div>
  );
} 